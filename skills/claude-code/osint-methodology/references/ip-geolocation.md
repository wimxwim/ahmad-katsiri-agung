# Network-Based Geolocation Techniques

IP geolocation is frequently inaccurate — CGNAT pools serve hundreds of users from one IP, IPv6 blocks are too large for pinpoint databases, and mobile carriers route traffic through regional gateways far from the user. This reference covers multi-technique estimation for when standard GeoIP gives contradictory results.

## Multi-API Cross-Referencing

Never trust a single GeoIP source. Query 3+ APIs and look for a consensus city/region:

| API | URL | Limits | Best for |
|-----|-----|--------|----------|
| ip-api.com | `http://ip-api.com/json/{ip}?fields=query,status,country,regionName,city,isp,org,as,asname` | 45 req/min free, no key | City-level + ISP/ASN |
| ipapi.co | `https://ipapi.co/{ip}/json/` | Free low-volume | Country/city/region/ISP/ASN |
| RIPE IPmap | `https://ipmap.ripe.net/v1/locate.json?resource={ip}` | Free, keyless | Confidence-scored location |
| WHOIS APNIC | `whois -h whois.apnic.net {ip}` | Rate-limited | Prefix assignment notes, city in netname |

## Ping Triangulation

Measure latency to speedtest/servers in multiple cities — the lowest latency cluster is where the network path is shortest, strongly correlating with physical proximity.

```bash
# Generic pattern
for city in jakarta bandung surabaya medan makassar; do
  echo "=== $city ==="
  ping -c 5 "${city}.speedtest.telkom.net.id" | tail -3
done
```

**Rough latency-to-distance mapping:**
- <5 ms → same metro area
- 5–15 ms → same region (Jabodetabek, greater metro)
- 15–40 ms → different region on same island
- >40 ms → different island / cross-country

**Dedicated targets for Indonesia ISP triangulation:**
- Telkomsel: `{city}.speedtest.telkom.net.id` (jakarta, bandung, surabaya, medan, makassar, balikpapan)
- Biznet: `speedtest.{city}.biznetnetworks.com`
- MyRepublic: `{city}.speedtest.myrepublic.co.id`
- Host your own `tcping` server on known infrastructure if speedtest servers are inaccessible

**Verification:** Run from 2+ different test targets (different ISPs) to rule out routing anomalies. 5+ pings per target for stable averages.

## Traceroute Topology Analysis

```bash
traceroute -n <target>
```

- Look up each hop's IP via GeoIP.
- Hops with hostnames containing city codes (e.g., `bdg` = Bandung, `jkt` = Jakarta, `sby` = Surabaya, `mks`/`upg` = Makassar, `mdn` = Medan) reveal the path's geographic route.
- The last hop before the ISP backbone often marks the nearest Point of Presence (PoP).
- CGNAT hops (RFC 6598 `100.64.0.0/10`) indicate carrier-grade NAT — public IP is shared.

## Understanding Accuracy Limits

| Scenario | Error Magnitude | Why |
|----------|----------------|-----|
| IPv4 + CGNAT | 10–50 km | GeoIP shows CGNAT gateway, not the user |
| IPv6 /64 or /48 block | Province-level | Single city assigned to entire block (ISP's regional HQ) |
| Mobile tethering | Variable | Public IP from mobile carrier's gateway, different from tether location |
| Corporate VPN | Global | Public IP = VPN exit node location |
| Satellite internet | Contiguous US | Gateway location, not beam spot |

## WiFi BSSID Positioning (HTML5 Geolocation)

Google/Mozilla maintain BSSID-to-location databases mapping known WiFi AP MACs to their last-seen GPS coordinates. This is the mechanism behind the HTML5 Geolocation API.

**Accuracy:** 20–200 m in dense urban areas (if BSSID is in the database). Degrades to 1–5 km in rural areas.

**To test locally:**
```bash
# Scan nearby WiFi APs (Linux)
sudo iw dev wlan0 scan | grep -E '^BSS |SSID:'
```
Or redirect user to `https://where-am-i.net/` in a browser (requires user permission).

## Recommended Workflow

1. **GeoIP layer** — cross-reference 3+ APIs → note region/city consensus.
2. **Network layer** — ping triangulation across 4+ cities in the suspected region → identify lowest-latency cluster.
3. **Route layer** — traceroute to `1.1.1.1` → inspect intermediate hop names for city codes.
4. **Registry layer** — WHOIS the public IP's prefix → look for geographic assignment notes in `netname` or `descr`.
5. **GPS layer** (if possible) — recommend browser-based geolocation or WiFi scan for meter-level fix.

**Confidence rubric:**
- TENTATIVE: 1–2 APIs agree, no network-layer verification.
- FIRM: Ping triangulation + traceroute + WHOIS all point to same city.
- CONFIRMED: GPS or HTML5 Geolocation API (requires browser permission).

## Key Takeaways

- IP geolocation is best-effort, especially under CGNAT and IPv6.
- Ping triangulation is the most reliable free technique for narrowing a mobile/CGNAT user's location.
- Only browser-based GPS (A-GPS = GPS + WiFi + cell tower combo) gives meter-level accuracy.
- Multiple independent techniques that converge on the same location = high confidence.
