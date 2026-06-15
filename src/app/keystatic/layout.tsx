import KeystaticApp from "./keystatic";
import { getShowAdminUI } from "../../../keystatic.config";
import { notFound } from "next/navigation";

export default function RootLayout() {
  if (getShowAdminUI() === false) {
    notFound();
  }
  return <KeystaticApp />;
}
