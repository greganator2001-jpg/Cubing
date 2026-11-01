; Runs before install: clears out every older copy of Last Layer Lab.
; Your progress and settings (in %APPDATA%\Last Layer Lab) are left alone.

!macro llRemoveInstallers DIR
  FindFirst $R1 $R2 "${DIR}\Last Layer Lab Setup*.exe"
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
  ${AndIf} ${FileExists} "$R0\Uninstall Last Layer Lab.exe"
    ExecWait '"$R0\Uninstall Last Layer Lab.exe" /S --keep-app-data _?=$R0'
    RMDir /r "$R0"
    DeleteRegKey ${ROOT} "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  ${EndIf}
!macroend

!macro customInit
  ; close the app if it's open
  nsExec::Exec 'taskkill /F /T /IM "Last Layer Lab.exe"'
  Sleep 800

  ; old per-user and all-users installs (wherever they were put)
  !insertmacro llUninstallFrom HKCU
  !insertmacro llUninstallFrom HKLM

  ; leftover folders from older versions
  RMDir /r "$LOCALAPPDATA\Programs\Last Layer Lab"
  RMDir /r "$LOCALAPPDATA\Programs\last-layer-lab"
  RMDir /r "$PROGRAMFILES64\Last Layer Lab"
  RMDir /r "$LOCALAPPDATA\last-layer-lab-updater"

  ; stale shortcuts (fresh ones are made after install)
  Delete "$DESKTOP\Last Layer Lab*.lnk"
  Delete "$SMPROGRAMS\Last Layer Lab*.lnk"

  ; old installer files lying around
  !insertmacro llRemoveInstallers "$PROFILE\Downloads"
  !insertmacro llRemoveInstallers "$DESKTOP"
!macroend
