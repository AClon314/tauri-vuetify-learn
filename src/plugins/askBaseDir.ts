import * as tPath from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/plugin-fs";

async function askDir(base: fs.BaseDirectory): Promise<string> {
  switch (base) {
    case fs.BaseDirectory.Audio:
      return await tPath.audioDir();
    case fs.BaseDirectory.Cache:
      return await tPath.cacheDir();
    case fs.BaseDirectory.Config:
      return await tPath.configDir();
    case fs.BaseDirectory.Data:
      return await tPath.dataDir();
    case fs.BaseDirectory.LocalData:
      return await tPath.localDataDir();
    case fs.BaseDirectory.Document:
      return await tPath.documentDir();
    case fs.BaseDirectory.Download:
      return await tPath.downloadDir();
    case fs.BaseDirectory.Picture:
      return await tPath.pictureDir();
    case fs.BaseDirectory.Public:
      return await tPath.publicDir();
    case fs.BaseDirectory.Video:
      return await tPath.videoDir();
    case fs.BaseDirectory.Resource:
      return await tPath.resourceDir();
    case fs.BaseDirectory.Temp:
      return await tPath.tempDir();
    case fs.BaseDirectory.AppConfig:
      return await tPath.appConfigDir();
    case fs.BaseDirectory.AppData:
      return await tPath.appDataDir();
    case fs.BaseDirectory.AppLocalData:
      return await tPath.appLocalDataDir();
    case fs.BaseDirectory.AppCache:
      return await tPath.appCacheDir();
    case fs.BaseDirectory.AppLog:
      return await tPath.appLogDir();
    case fs.BaseDirectory.Desktop:
      return await tPath.desktopDir();
    case fs.BaseDirectory.Executable:
      return await tPath.executableDir();
    case fs.BaseDirectory.Font:
      return await tPath.fontDir();
    case fs.BaseDirectory.Home:
      return await tPath.homeDir();
    case fs.BaseDirectory.Runtime:
      return await tPath.runtimeDir();
    case fs.BaseDirectory.Template:
      return await tPath.templateDir();
    default:
      throw new Error("Invalid base directory");
  }
}

export { askDir };
