'on error resume Next
'this is code i cobbled together 3 years ago, not sure if this is a working copy and if so, on what Win OS's it worked
Private Sub GetWMI(WMIArray, WMIQuery)
 Set WMIClass =
GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\wmi")
 Set WMIArray = WMIClass.ExecQuery(WMIQuery)
End Sub

Function SigStrength()
 Call GetWMI(objMSNdis_80211_ReceivedSignalStrengthSet, "Select *
from MSNdis_80211_ReceivedSignalStrength Where active=true")
 For Each objMSNdis_80211_ReceivedSignalStrength in
objMSNdis_80211_ReceivedSignalStrengthSet
     SigStrength =
objMSNdis_80211_ReceivedSignalStrength.Ndis80211ReceivedSignalStrength
 Next
End Function

Function BSSID()
 Call GetWMI(objMSNdis_80211_BaseServiceSetIdentifierSet, "Select *
from MSNdis_80211_BaseServiceSetIdentifier Where active=true")
 For Each objMSNdis_80211_BaseServiceSetIdentifier in
objMSNdis_80211_BaseServiceSetIdentifierSet
       array_bssid = objMSNdis_80211_BaseServiceSetIdentifier.Ndis80211MacAddress
       For t = 0 To 5
               array_bssid(t) = Hex(array_bssid(t))
       Next
       BSSID = Join(array_bssid, ":")
 Next
End Function

Function SSID()
 Call GetWMI(objMSNdis_80211_ServiceSetIdentifierSet, "Select * from
MSNdis_80211_ServiceSetIdentifier Where active=true")

 For Each objMSNdis_80211_ServiceSetIdentifier in
objMSNdis_80211_ServiceSetIdentifierSet
     ID = ""
     ' for Ndis80211SsId [0] is the last char of the ssid and the ssid starts
     ' at [4]
     ss = objMSNdis_80211_ServiceSetIdentifier.Ndis80211SsId(0)
     For i = 0 To ss
       ID = ID & chr(objMSNdis_80211_ServiceSetIdentifier.Ndis80211SsId(i + 4))
     Next
     SSID = ID
 Next
End Function
'geekdom = 00:09:5B:ED:9C:87
WScript.Echo SSID()
WScript.Echo SigStrength()
WScript.Echo BSSID()
