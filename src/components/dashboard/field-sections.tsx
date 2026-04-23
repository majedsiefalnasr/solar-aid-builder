import { FieldDashboard } from "./field-dashboard";
import { ReportsSection } from "./reports-section";
import { MessagesScreen } from "./messages-screen";

export function FieldSection({ section }: { section: string }) {
  switch (section) {
    case "overview":
      return <FieldDashboard />;
    case "reports":
      return <ReportsSection role="field" />;
    case "messages":
      return <MessagesScreen role="field" />;
    default:
      return <FieldDashboard />;
  }
}
