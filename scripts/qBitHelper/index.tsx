import { Navigation, Script } from "scripting";
import Helper from './utils/public/helper';
import './app_intents'; // 导入 AppIntent 注册

async function run() {
  await Navigation.present({
    element: <Helper />,
    modalPresentationStyle: "fullScreen",
  });
  Script.exit();
}

run();