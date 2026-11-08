; Runs before install: clears out every older copy of the app (it used to be called Last Layer Lab).
; Your progress and settings (in %APPDATA%\Last Layer Lab) are left alone; the app keeps using that folder.

!macro llRemoveInstallers DIR NAME
  FindFirst $R1 $R2 "${DIR}\${NAME} Setup*.exe"
  ${DoWhile} $R2 != ""
    ${If} "${DIR}\$R2" != "$EXEPATH"
      Delete "${DIR}\$R2"
      Delete "${DIR}\$R2.blockmap"
    ${EndIf}
    FindNext $R1 $R2
  ${Loop}
  FindClose $R1
!macroend

!macro llUninstallFrom ROOT
  ReadRegStr $R0 ${ROOT} "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "InstallLocation"
  ${If} $R0 != ""
    ${If} ${FileExists} "$R0\Uninstall Last Layer Lab.exe"
      ExecWait '"$R0\Uninstall Last Layer Lab.exe" /S --keep-app-data _?=$R0'
    ${ElseIf} ${FileExists} "$R0\Uninstall The Cube Timer.exe"
      ExecWait '"$R0\Uninstall The Cube Timer.exe" /S --keep-app-data _?=$R0'
    ${EndIf}
    RMDir /r "$R0"
    DeleteRegKey ${ROOT} "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  ${EndIf}
!macroend

!macro customInit
  ; close the app if it's open (old and new name)
  nsExec::Exec 'taskkill /F /T /IM "Last Layer Lab.exe"'
  nsExec::Exec 'taskkill /F /T /IM "The Cube Timer.exe"'
  Sleep 800

  ; old per-user and all-users installs (wherever they were put)
  !insertmacro llUninstallFrom HKCU
  !insertmacro llUninstallFrom HKLM

  ; leftover program folders from older versions (never the data folder in AppData\Roaming)
  RMDir /r "$LOCALAPPDATA\Programs\Last Layer Lab"
  RMDir /r "$LOCALAPPDATA\Programs\last-layer-lab"
  RMDir /r "$PROGRAMFILES64\Last Layer Lab"
  RMDir /r "$LOCALAPPDATA\last-layer-lab-updater"

  ; stale shortcuts (fresh ones are made after install)
  Delete "$DESKTOP\Last Layer Lab*.lnk"
  Delete "$SMPROGRAMS\Last Layer Lab*.lnk"
  Delete "$DESKTOP\The Cube Timer*.lnk"
  Delete "$SMPROGRAMS\The Cube Timer*.lnk"

  ; old installer files lying around
  !insertmacro llRemoveInstallers "$PROFILE\Downloads" "Last Layer Lab"
  !insertmacro llRemoveInstallers "$DESKTOP" "Last Layer Lab"
  !insertmacro llRemoveInstallers "$PROFILE\Downloads" "The Cube Timer"
  !insertmacro llRemoveInstallers "$DESKTOP" "The Cube Timer"
!macroend
