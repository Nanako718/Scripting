import { AppIntentManager, AppIntentProtocol, Widget, Script } from "scripting";

export const RefreshIntent = AppIntentManager.register({
  name: Script.name,
  protocol: AppIntentProtocol.AppIntent,
  perform: async () => {
    Widget.reloadAll();
  },
});

