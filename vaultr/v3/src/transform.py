import re, sys
S='/tmp/claude-0/-home-user-Hotel-Aria/a041b5ed-e933-5422-983a-84a38bfd37ea/scratchpad'
M = {"#0C0E11":"#0D0A1C","#15181C":"#17122C","#1C2026":"#211A3F","#262B33":"#2F2754","#2A2F37":"#33295A","#2E343D":"#3A2F66","#2B3038":"#2A2152","#171A1F":"#1A1438","#101216":"#110D26","#13161A":"#150F2C","#14171B":"#150F2C","#1A1D22":"#1C1638","#1B1F25":"#211A44","#1D2127":"#231B47","#0A0B0D":"#07050F","#07080A":"#07050F","#0F1215":"#120D26","#0E1013":"#100B22","#111317":"#130E2A","#101317":"#120D26","#2E333B":"#3A2E70","#181B20":"#1E1742","#0F1115":"#120D26","#1C2027":"#221A48","#0E1014":"#110C24","#30353E":"#3B2F72","#0D0F12":"#0F0B20","#333944":"#3D3270","#3A404A":"#4A3F7A","#323843":"#3D3270","#1E232A":"#251D4A","#2A3039":"#33295A","#23272E":"#2A2150","#0F1114":"#0E0A1E","#8C929C":"#A39CC8","#EDE9E1":"#F5F2FF","#F2EEE6":"#FFFFFF","#E3B04B":"#FFD60A","#F6D58A":"#FFF08A","#9A6A14":"#FF8A00","#FFE7A8":"#FFF6B0","#FFF1C9":"#FFFBD6","#8E5F10":"#E06A00","#3A2706":"#3A2000","#1A1205":"#1A0E00","#5BD192":"#3DFFB0","#FF5B4F":"#FF3D5A","#2A2112":"#2A0F3A","#3A2A10":"#3A1046","#4A3610":"#4A1A5A","#1D160A":"#1D0F2E","#262B33":"#2F2754","#2C3038":"#2A2152","#22262D":"#2A2150"}
def tx(s):
    for a,b in M.items(): s = re.sub(re.escape(a), b, s, flags=re.I)
    s = s.replace("rgba(227,176,75", "rgba(255,214,10").replace("rgba(242,238,230", "rgba(255,255,255")
    return s
t = open(S+'/v2/theme.css',encoding='utf-8').read()
t = tx(t).replace("*{font-stretch:normal!important;font-style:normal}", "*{font-stretch:normal!important}").replace("*{font-style:normal!important}\n", "")
open(S+'/v3/theme.css','w',encoding='utf-8').write(t)
b = open(S+'/v2/body.html',encoding='utf-8').read()
b = tx(b).replace("Big Shoulders Display", "Barlow Condensed").replace('"vaultr-demo-v9"', '"vaultr-v3-demo-v1"')
open(S+'/v3/body.html','w',encoding='utf-8').write(b)
print("ok", "font-style:normal!important" in t)
