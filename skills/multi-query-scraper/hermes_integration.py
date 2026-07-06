#!/usr/bin/env python3
"""
Simple Hermes integration point
Just call this with location + business_type
"""
import subprocess
import sys
import json

def scrape_location(location, business_type, keywords=None, use_mock=False):
    """
    Call the multi-query scraper skill

    Args:
        location: e.g., "Jakarta Selatan"
        business_type: e.g., "Kuliner", "PT", "Restoran"
        keywords: list of keywords to search (optional)
        use_mock: True = fast test, False = real Google Maps

    Returns:
        dict with status, output_file, entry_count
    """

    script = "test_restoran.py" if "Restoran" in business_type else "test.py"
    if not use_mock:
        script = "coba_kuliner.py" if "Kuliner" in business_type else "run.py"

    cmd = [
        "python3", "-u",
        f"/home/ngome/.agents/skills/multi-query-scraper/{script}"
    ]

    print(f"🔍 Scraping {business_type} in {location}...", file=sys.stderr, flush=True)

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

        if result.returncode != 0:
            print(f"❌ Script failed: {result.stderr[:200]}", file=sys.stderr, flush=True)
            return {"status": "error", "error": result.stderr[:200]}

        print(result.stdout, file=sys.stderr, flush=True)

        # Infer output file from business type
        output_map = {
            "PT": "/home/ngome/Desktop/Test_Multi_Query_Output.xlsx",
            "Restoran": "/home/ngome/Desktop/Test_Restoran_Jakarta_Selatan.xlsx",
            "Kuliner": "/home/ngome/Desktop/Kuliner_Jaksel.xlsx",
        }
        output_file = output_map.get(business_type, "/home/ngome/Desktop/output.xlsx")

        return {
            "status": "success",
            "output_file": output_file,
            "business_type": business_type,
            "location": location
        }

    except subprocess.TimeoutExpired:
        return {"status": "timeout", "message": "Script took too long"}
    except Exception as e:
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 hermes_integration.py <location> <business_type> [mock|real]")
        print("Example: python3 hermes_integration.py 'Jakarta Selatan' 'Kuliner' mock")
        sys.exit(1)

    location = sys.argv[1]
    business_type = sys.argv[2]
    use_mock = len(sys.argv) > 3 and sys.argv[3] == "mock"

    result = scrape_location(location, business_type, use_mock=use_mock)
    print(json.dumps(result, indent=2))
