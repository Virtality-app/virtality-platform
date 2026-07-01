# Preserve Rep and Set End Socket Payloads

`RepEnd` and `SetEnd` continue to use the existing JSON-string socket payload contract while the console normalizes those payloads into typed progress events internally. This preserves compatibility with the headset client and avoids coupling the progress-flow cleanup to a coordinated VR protocol release; a future protocol migration can change the wire shape deliberately when both sides are ready.
