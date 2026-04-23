import { FieldDashboard } from "./field-dashboard";
import { ReportsSection } from "./reports-section";
import { MessagesScreen } from "./messages-screen";
import { SettingsSection } from "./settings-section";

export function FieldSection({ section }: { section: string }) {
  switch (section) {
    case "overview":
      return <FieldDashboard />;
    case "reports":
      return <ReportsSection role="field" />;
    case "messages":
      return <MessagesScreen role="field" />;
    case "settings":
      return <SettingsSection role="field" />;
    default:
      return <FieldDashboard />;
  }
}
