// LEGENDA MOTION TEMPLATE v3
// Gera um HTML de legenda karaokê (palavra a palavra) com FUNDO TRANSPARENTE e window.render(t).
// A Dafne v3 renderiza com --alpha (.mov com canal alfa) e o Salsicha sobrepõe direto no vídeo:
// sem chroma key, sem franja verde, sem flash na troca de card.
//
// O ESTILO NÃO É FIXO: vem da ficha da marca (ficha.legenda) ou da referência analisada pelo Fred.
// Só existe um padrão de segurança (Poppins, branco, contorno preto) para quando nada for informado.
// Este arquivo é o MOTOR, não um modelo: o visual é RECRIADO a partir da referência. Parâmetros prontos
// (fonte, cores, destaque, caixa atrás do card: fundoCard...) cobrem o comum; para o resto, escreva CSS
// em estilo.cssExtra (ver ESTILO_PADRAO). Nunca declare "não dá para reproduzir" sem tentar cssExtra.
//
// Uso:
//   const { gerarHTMLLegenda } = require('./legenda_motion_template');
//   const html = gerarHTMLLegenda(segmentos, duracaoTotal, { largura, altura, estilo, limites });
//
//   segmentos: [{ start, end, text, words: [{ word, start, end }] }]  (tempos do vídeo editado)
//   limites:   [segundos] tempos dos cortes de cena — nenhum card atravessa um corte
//   estilo:    ver ESTILO_PADRAO abaixo (todas as chaves são opcionais)

'use strict';

const fs = require('fs');
const path = require('path');

const POPPINS_BOLD_B64 = 'd09GMgABAAAAAB9AAAwAAAAAP0AAAB7sAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGx4cLgZgAIFUCuZ00SoLgzYAATYCJAOGaAQgBYNUB4QLG+oxRQdy2DgAyLbcS0TV5rjs/yqBGzLAPkyREBGREI4TMAKGY6ho/8mlE3lfKXPE5MdOFY4ooV9DLC/sdo35vTdCktmWiFqD7Jm9Z1RAARIOmHUqilx0FDkC4RCMexAmzDs8uK1/ag4y10gtEQQEQRlTBJnLAboBRZYKKYqJZo5ZOHZ1d17ZXl+tbnveWo3pjVXdaN3ql0tjbau3ioq2kxzJqu1FnBOk4f+/zuy9/w0n90qZLfotm4EPsrUehT0LGCKptepFwMqKwgMJL1IAOFCmFeKkoaI+P99dqZrtUqDmQWc6xFB0hhxquKhz7epwRxAg7yFmPwhRCVSiIshPoPTjAehEwolyDJ2/k7+yMz5nSk4hVq5clCEXnfv6K4fOqqYWysrqWIJCoHaG4eryvWM56yZpVy1bEyyBwiAR5O6lj1EAayVJ4nPRJYoCEGQNwJw4cRAWll9+/EPVbiKIdjCSkzZCt2VUtog/0Ke4N+DKgtyDGAVstYqT5TPE5TeJ1OBN4MCONQn/zwHT4qxrHwDPAfS0Xgbs6+SAAkbfdn586vAaloQzTj2T6wAbtFsNIfm91KXe7O190dAE6EYoDIqEZkEF0GMpMFgkLEZZTOiH2j0p76AoaDw0icv4TTXz2Twz355js/5/yEsvvnvxcOXCytmVMysnV46t7FoZW8HcO3936e67wMeL74RY3gb8xG54i9125ChjO5Bf61fQ3p+TH3++fLBiAoK7iu97ux/fOYkbQTaOj7VWfK9Org/4Wj8rfEgvGiMFVyXUAF+iOCwXrA0+5V/Dr9p3vhCGUlDq5C0MP9JrN1gbGCKCil9TGjMsSgKyEROyjJcZBCbYOEdzoD95SK1ZeLvLjs6pvpjQjUlfkgXsgH8NX2+GMEuxHeKK7snmKGXfUQlXuLvMED28A9pK8rg3DFxroW7ocGTCuoP3tedzu4sl+/jEc0TM9xMOgRdfh5MmLdqc2PAoDzfco6s23lWR6iY8fjipzoHqj5I5CqGEr5PTdVYIDnxoCyNtXLFkDy8hney5+Qxzfwr4nxCtz2LYat0guCLD8NR3WJWpDkIZYPsdQmo92x0FpBG2Vm5NF5Xk4HD8+WvNJe/IVclGu5gtVk4ppVm1467QAH/ABs5fntdXAnDsDaxCC7J8jWoDpWYTizcu4doVKal+x4qd2xtu9wganwnrhGPsuTOOjx/PdOH+EJsE1ulz3d8+0xjpnsH6tYUwldKQ1IdrjmP1p/5M0+tQ/giB1/YWVr9S2dyA8ptf6513wSO6EEP0gW47BAqlUhgz5I0Z5D2zTWL1zNXaEq60tPFVqr8cFsoOurFtHVYxNtFdaAmn0jyVRNnwXJuTL78wB03ywaoAK8ugWsqlaR6VNkQd01AkmTHPuDuRp9kIOXtvsc5FJ4VY2qbfX1s0f/64iBJe1wSmqomERbuXcG2i6Yl68GHU0pfE8dNWG6REHhsTbVsrf0JokKGph63idEI4t80h0vndsl6vt6kLeof4vcysA74h3MfEQ87RSbM2/i21Vup45j6gXNH0lczuAOXjnwKaivKklFYKLGDyZ0iHCscrCNLmxKHgCGGY/S4sk3RTLXuPAusytjEcW6DWITxxDZ/Gl/jiS03N0hTK9+pk0eWptnthWIhFhqeSdFO5VpKN2Qy625+jnklBU5niSfjndndgk5CBJrVFh4lrjRMBIdoXRpsOj5hybtkaKck3tP/nRIYDvaNiBtu+u7ZarvIT1aKtUSwdh39XNWmgrz79CqtL1K4Pr6hhpdK4/01OK2UqHdKQY4nBtnCEWrhxbuLeqtkyodzBkA4gxt5Xmr4AZTC73yiygN2CDrrQwnhNi6UJK7PdfRUWOSr2L9owc7fCvOQ0OORD+shssDsTqGqDPPaTtRwnmsp+QY+CdRv3ce9GKPtGo23pMLAyEtR54fFeR9Vr8IC0WQKhYrlPxCfExE6rx8tPaCMGl+gBQe4n13b9Hp88eL7NxPHwEElx1xgGFsraCCGfXQLh99KiJA7jOkM4i5RODXfshRkD28OwF/TL846WBw4U2wrMdw7KlweSPJrIRBJ9xlgiDZeLzYu9rvJ/PnZxWOHQtF/a9x1dehNyIlKVJ9A9XYM+hbiI14MtdXwKSXvE59g7i+BH2tBn4EEKn9Z19+amfCS6FNopu0p2W+o8yzDUNuf0P3IFiA3yjx30PcgXZx76chTkr3+GlWyXiNahFFMaRvdEpoNS103hSmhG1TUrKi149Hnh4wieiehrlZxm1g71s69QY4TsFVKIq1acF+TassOPnveEv9V/2nwjjx1ANtCEZUvSiVVncRzgzGedTLD2xBq0wZe+UZLw/jWsGqDECmJQMV62U3Ar9Ma1C2tzs/NvDPKK77/wnE81uf/c28H1cmL23clCiEJkEVEaU5wTSjTUQ1AOzcVwPw1GsDwTv+RGIZx5sycRxNpyIDbrr+a4uVh6NaUExv/o8hUo4VAtr1eV38cvzdH0yjpSWTY7FO7wxAkkaW8z6+HlNkds+9BAn8gwlzed0ZiWKD/ncLtAE+2m/JhHF7SH+jzChWOpdMf6wml3vlYSjf/WVBkfS9A0snCIS76uxqdPpoInNmnDwy4eiEIZOaPuC/TJo0EReHwlYUKfwkI8u6twGoN4vxGD/owz6KIDGyOnpI2vwX347jsuhQGoxcKin13ReB4iM938GSDs37yEa0eOHh4pDI4F9obHs0tSD+cbxdLvJy06cTo9aUE10qek7pYtzgdTSTDR9igcrmV2i83OpOab5FLrS5LSBaTyoH3J+Ntoozi5yXBzyPnQ2OX87ndNNLgxi/iemKnXF/gLd/zdbccZ3pZvR3t8jyfUpDDGirmEZOp7jKw9cQhK73G2BkHw09DgiMVX/0WS5YVhMg7EjpZyK5OTLQ3cbS18KO9HE6dpur+WZwrRkJKaw9/Bvsr6/AyvQONTbN46HMWd5FtXqKYL6eSuXhI9tpna/qyQQZmN+JykBTk8i4tv1dkzGe5NpC4gMTRocFRq3G7nqmlBBI1t687plzyl8v9UO2rng4TruG4muy54MKW9LA/BDDZ65IjSh+KSPg/p2G3/l3YKTdwNBK3Ldlmv++WK5FC1oHNhwCvFb9LNu4FmHu2nMaziZarNsEhqNtmQQUbK7syZdlLiHgnlXUOodRGtQ4rHoikK7oCyWfZ/0VCRuhrkuNEgOASBmT6OJVEn6qWnb+PewYLDL99PN4TYyIuZbl8uGfz7Xth37vDv0j4OhcNDkYiXPu+XCAD5amPwV/p1X8HWfbqBo29Cd27dsgt+uHeCC9Cjzmw5szVMbzkN298DuAC9bR1boBeu784LgDpJLjFnCdfkcvKqglrMPoXT/mJ+6BviiEJ4jlpY2FZXGZjLydUHNlQFFM5gMcuXZZE6WI5K6IzcXHac/Ari7PaTsJSZ2pMgtb5IKxIVaRXKpjZl59TA4kD/4phYpaYlXk1TMeJHigpEIl2BUqlrsuLCqEl5/AFi0NUqOqiQyww6r7KRnGPgCJV18pTdbXA8QVGWzs4pzkxXQwdA5IYkTsL6z6NOHo+I8qFXjAs91MpDB4Ytvx49bMCocfxsuglqA9+Y7fCDR51Yu34opM7agHh1R22CyRI6BKDvhhLl6I5X96gWDRlqoXb06MGY2VAOho8Tijsz3u6kspqi2EFrzKC9hKov16sDSyx1FMZus8VtA2rk5bd73r7s+fwq4M54Y3wJJx6UBTghP/Gds+E/WAft8IAMa3tnbKz9+Im29+jy3okxaaRphE4fSceTKSLMs3T67N8yBYAXdj66MVoEDK/p1fV2uYtO+pdIpPAgA37Nfa3WhpbNVar8oRqrTopq/N0KmG1dtTVSC5Gso+VwdJ+uGeOUSrKp5XayvH6o3s8xEH6fRrLisuUkzQbXhmF9eiY+E0YdBBlDDtFXe5eLPEXD3uGgox8TPgEb9YKjUiUUq6kW4mrZrq7tLQ399UGlA/1/EJhMKYudzWFiWs70HXsX7FNAMoQcB2hrLsVSuVU0ml0upjvqWAqruzRjX8vFLQsDNld9UEHXrvNiFpPJ47OobC49K5vPBGscEMdwcIVu83dAdr6OSi1ykDUaQfKhpNIoeUsWVmmOQGBqpsjlborAJMhhlZlXg/tJxP1E3Ht4/FXcgQ9EDCpRwGYy+TkEijCLAe7uHsazaWaPMw+O55jJTKvc2d3VMNx4/mIXdn+ttkJmoVPLaF2vnX2DymRzqFQ2j0bJ5rFAWveNe7fwqdsTgI54T4oH+ocOivint38kp2/eA84v2jdVVW4xW/0UrWsO4wrLcSwsHJuRgu1ZR9FbKWLzdRd/qD4ZOawtecWcRx+rKZaR/+tfKsWSFNoStZzVWacS6p53N2WEwMLjafGpeH58NalloqffNe+wXmlqG+/tN0phUaUVqMZNBwtKX7FMDPzxeHBGlTEPE6ZhvkIj2jaK09Bb08CfPbG4non/FvZ+eibzn5rguqUGwSVyPZtOLbBkinELULEZR84lszi5mtXZkliGwZQTO964OoLFnSFtuzQEYO+Wze0uMTWdbIbZ9tTrCAxWBZ1sEQnJ1go6i6Ej1u+B2U+43abdJWV7LODA/AFtyazNVvLqAa3j6cJTK6+5ua6u2eOo+qQKfC45+cD5YB7SMLU41QCezNfDz95z3kN5FwDm59Z8HJ2tp1EsAhHVYqRxNdUFYfI/azyeEElp66ispHpOtGopm+OSTO7jDVAL6J9f8KLT0d4hl5yeDD5fjWMB3Jq/b27aVGXyuKzedZ0o5FbMffDZCyrthyUwXtAPJxej9OBzx0/OhnsbIH23kIxLC+/ZF99baqmv3wl4m8Aub/bde95Fcb234gXIgL2l+jmLeUAcXlk1V1oxZ7ZUrJbIbtPTKTaRiGLV03JyDDQI+Mm2Geg5gHuYbNzE1DWt8y745NbT6Eb2+6ZGvLnB+ZETKDy29oWMSnEjy1U7+JmvnxVP0Dvn8P2nAo7vDOOFexcCcuvpdEO2UO1QRR9I2LK5ieEm4BsZTeBhQCOBXx42jTHiCe3I5MK+DfyoAmS2isdmlTrxkto+a0D5rqjhTDQkLUlg3siP0qJYai6doXfSlSB5vn5B6pUu1INP50+JpTK+QCoTnxo6WazwdLDUqnaW1FN8ElycX50/sjo//QbmCgaw5xbent/f9efAn3vB4sK0Z8PQhld7E1oTwM/T9wfuz97S3y3eM/1r/6+zNyvulgDn/IOlJ94nD5dmp9iTbPBVU5b7di3tGt3HAeLhrzY0tzY3PjeCD85FfG0diPjBCqzvPm88MDc8BycPjPwR3fd4cUf3OMB5VK+8F/xxzvSjtQFA7bzOBqGYXUY4rx7CDOUeqCCyRQ1iXpf2LB4l4SNRKC4iTUIkpsl4qEKYzRISeAAqCCzxiSJeh1bL62oQnzTjL6i9P3iDU0diUR5iauch06RxWUoEdAbJM0cCULuwo1WksfSZY8tmzg5gsoU6jVqoy9aul8/EFvfbzJpWkbBDpwq4XKnGjKXA4R+G83aUE7pT4Pp0iH1pU3Ipn6qC8mbi1P3mKk27SNSp1Qk7twjz1G18QVvuKMpfzqGRRexmwLtgvDh8MceVk2R26Rt93VBXZpwRlBLL8QfUQxlK1uZWUZF7ug5SsX2/BEtmySUy3YEKEksCWoDUNbpwX44JLhKMVKpdLvQSeVwRI4sn4hG9P3hX9xan0YC5ZqpKIBCf9yjgYrwYUF0zfq2NYKmsRKNlN6dBdyT1ecHQ4oOH59z2z9+/8CTmWRT4/Ptig34AlDPEtrZNQi+RyxUwGDwBl3jFZK0NxsufK0CRuNXUMyfNjGxwk9Dyo0USfHKNhGd1aWRwP2irSNKp1co6O0UajYVkeQ0VnV2iXEQLLxUlpajzCrKzNQVqtYqzgweri0Rrf9tYZYT3Cr1EryZ19EftVkFHk1jMLMGekQwRhwrOlmcyRY0Sfmf+WQJaykMgEcmAlpBIaJmgQlAh/mI/WA0E+gSCx2Mpo70Yrw58HVSDZ+fDhnJs6LTP1ifa37irSqZz6RlkeWU6v6qp0j+/DxqARm5fn9R24ory2M8LwD+DGB74+cK6pENQrrvo9LFgnos3ODTY5gJqNGZItFeXRuJWUel2mdBLwAS4W0ACSO/YfmjqY/SRj9DTgJyH2YOeMXWZunbMoYeN+237Jy37jPtAc/1R09HpczEXomY3Hak+Mn0+6mIM0KFjXPip5qg7ia8Nd412gXcb/nZN1z8SPnKN14O6PU+CEZggFaQ8XVWmUwrdGDYzKTAfEliWSiEJpb4ykoAKCywLDsxPTL4FxTQLlWU6FRZSHqRCI4KfgJXNQ3uGQDk+GIFmZ7CGZgz0VnJiD8FuMCpJIPOVkoSU1A4gfUlMNsYNdekezFrVATyntFS40fd0XUhkQmaONdxQVu7+3VtDv02FV5nBVbrnUaQX1sL61R323QxwOHrGugLkjVWFgVqO1gFpGaqtNUShQDtUQVVzV6yomC1WCoX20WIDZu2mH2PEH6FLBIHJTkN+FJ8myKq0kYTORo+vvjPsL1KmJSthbu6SYW9yUDq0IALcYYU0D/72DY1+/s7Ogfss1v937lydZDAmVwc3B+fMVfjgMh7B4Y8yMlbg4MaOBuM+HxgPsmxcHvQO+lpDYPx9wNgwDZ2dFE4IZ0HARJp3xLs9Qn+kYBU2hycrTTiBsanCR+P1V0qQo8mxuznQX0rgRToOmaaeVlOOnzbGgpifrZ7wj+scgbAPhaqMILNGm5Skm8B8w+qk11Zm8Ps7syVFc1arIVaZLZXZUkzslYm3lZfJ7r2KkmIEtqzcvUdWkqOqotHNAgHdwjdHjtJZEC5sPToEyyDzOBwyNwP6yfbWcLEjTwUSRdhcOTYjrzujVl+Li/0QnanEYfMoDhwfgSDhcCQEgo8DPc2FJ9479Jae2EFedCLc87imwH3+ibf/7VrAftdAoRjYLIreQGWxzEDVs9hUwz6fJW7SFUmkeGkk2iKpVFsoKT+jRpFyVRhZgJx/1QafTnZFQgNngsIioKD/lqndBBIMtfpCXY0hN6/WSDdjXlxmdCo8moD3G9zheDBZ23bJ89Jzue2yqAO9A/k/BZg8d0ybrKlX/PBLbCQlPFlQC1fnCLGrbU/9qwPEDWpYkpw8Jm5j7FW/f6QbsVoaX6ZhIWq1qKjGyMjJWDgjORMZkReF0JjBH/M/Wk0/ukEJGjOkfaUoMwv7XfR24nYClydkMHhCLgGom1Vc1ebYSLfbXZpFrLDRNTzwBUZGo1AVDPpwXnP8UGSkN57dXkQEUXV5+ww1oSBRSMwtwjIYxVhCLpVCzC3GMRhFOEIuJREHR6T6ZeJ8U1OJOOBFlpzoMSpgxIckSGWf2CNF+0Lf1oUHLRhuLfdK1uSPUyuYsfGisWJQXsc4+cA+LG1Z7Nu8qLKgcGpl9myrHFzs+3y/K550bg33Stbwj7tW0sdmimdKwGZK8hh96HqxDEX8UGzKhIBVce6X2l+uBDgnup8Juna6Fh47xsvNi9Xgkjv3vM8b9dON1WvRNOwe2KYiiLdCvVNvyV5HgZPZ6pPyLFnkEaU8s4ibWx2OZk9d1bGDnoPHq8A9z9jY6GhJyeiY1+us1+spnXVsHEypZnEt4oJwOdkO+JtbjFV1r2d4RGb9zgLrYJ/XGIUnZJkKkSyTU4/kSoqkWVrg9QIugqzPFQu2eRe3D7ivP1161rK1n0DoZzi/dAKSiWly07WyOjxdk0l4o4qHDI6w7ZMn8FUs5aZyg77RCCnqRywg4fKkJF54fpKElZkCD/t4f1zqAIHtzYrzIgA3d53yaHsen4z/6tOZWPUWcwnLRFjO68j7RU9gFgbPgJbX0SSUNvJ0qnZVdjmaJWsQcNrUo9AgNT+bpuHtfP55geBMKhy+GdDnWC+fidZsqi6AoEz/QLj4ELOMvlmpK5+WAxL5nCNlVtl4pzRf0xHHa5Z0tAoVytvubhecI4pt+anvQ7MTxuFFt0K5qSgZlWqIbQjkU+Q8tkajZYLUPwJo7OdKz0vPLfvOtCD266cwIyM7KDZIiMVaRf6zlA0pHOZZJSHZtRfEsZ99J8PnCyMS8bGffhefgSwhxgcerg4J2eImMb8jP5/f1SQWZxdTPq32PvSGp257JFORaZ+SygEhF6TJSOAqOjNal4fTD2oeXIY4p8rVleM++tnSsrlfWBAXXiF2ETqKpxwQBpFiyfIPsQiFFAvKCwA5uQG0KbaITysHYWAhXCsZz9lE5mo6Sh7oGsapI+kza0i88hBal7xhrUxAp4j5pc8/5yFQMgrFZA5V5I/IuQa1WscEs/sm882TmgmNGTzawWMTCXw2mSwqgcgTsyB2ITp6IS7m0rABl2JA+G4Ohxjzf+aX0YgSeRB3rbZ3YhA1slkaOF5xQ92Akt2P+rid+WSy5rmR4YOJq24geu5e3FP99PP98T7/zBA/t0YOmpa/eKo+glI/NQMnVY1CqlMFKiJYR69lAcJHA4uD/YvgyRM3E0Z2Gz9hLrFp87kOWI02Xxi3LjTu4nxd/hSd29rcdKIZZts9osUzWBW08Tfzb8SFros7nv/WuJ7BAvGfQ/KuC7UJuf6/3PuMPrfvuC0u+eHHCsP2gm9LvwW/v+I+5AagrgMOiACsEgHkZSgR1mcXX2F7gQo/LFjoeYhJHeL73tgG181fssxfdoRvd3mn991n0vh8A1w3f0ntTnaVDJbPF8R185fmbzvZ579CUIo5xxBvyE8AcN38Jff5yz7ZyW6FofP5bnDd/CVXFHvHSjYRs+gRzDzwfQlUXDd/yQX+sp18u2PK+25lJEN8Z/gC181fMr2Tndfz9lDxN4KrE7l5ln7Zyv6lkqsM87qS12Hr2wJrrpu/5AB/2eBOdq8qRVjAsgRcN3/JsZ3s5pgyvtsxv12fvz7uPyjCrcaXi1By5Yns8uRK8FIYnHNz7r1++4QEAHoeEAeTP7Ibdv7repnQ0+Of0g59VyRP3csOCUDfGpeb+p31rvquc/cFIZAT43L9TtqlUuhPEavY/BvyvpZvPvScBkKXPj9c4PPf/t6Vqrw7JfB34UNzKfDuFHBAMNBH5ixl/t3KgQVv0Lb9TnkEDOemJCMDvGsX0SfiAf8PbMPOF0fIkRG0+rjpnD7SIXdzvwOL3lTZIFXesG37a/ofHLkpzcCCN6ioj/j//3cLawSEdWFarnjaBde9SzriNYgpz6Vxlg9gScDRtzuZ+rDs34L8/H4BOPbm4fcA4ORO6icvvn1xEvLpwges4gsgwO9zRtdcarD/0vGO/WXvE3lq8ve3a5EHlKYWYjRL6DDKYOW5rQVw70DkRzX4K4psABB0Tp6XwiomzhqAzU8Q7UOJXWrZsC2E65TM9lC3g7Cp4O2W1QbcBAJsBNCVUPc7htIUNwFsSSTuxxLaTTgAONhPCBtN2MhNX2JzWVI7I/BRaMRivccDIsBr8ERB50taI1K5oJ3H7/tCFwB29gRk2wSXg5hH+vvU8fzJ0UNSRqyahIG1PSDFNGFLQADYsikWs6JTXctU6ZjfV6KGvsQTHsq2HYwFDsQyyfwUqPRYXx8fp4XWDoXAJglqOf98D5n/c4SiAIO51YDiPs/OoHUYqgTZak4oFWwVSU2etSMCJp9KKgTgehgaoOuLy7i1uSSx++THamOqRfhPj/WRdxdoQgEpKGv9IDpvs86d2JsQfQYx0qGFpmN+Qe/ZcRikgmgb7J1Ykb759+DDXhXogpLQ3lmVpPFusFYYsLv0XkPG7AJrdqGQ2sEGewcm3jdfDD5uuxQXlIbCAdJ6xNQ2wIDdhZtxBEa+4MGXJCmJkhaWtf4VlC3Iv0I9XqeuhZMP53kuNHcy3FlqloRlhakXYZMNZ8smlg86ksUNhfWlEg+L14AP4IRR6zQK4MPXRgGAhwCDL2A1Mz8+CwQAr/u4OsQH1LFDfIWaPcQPm6F8zelD/K2lOyQAFDUUessBp1ob34ff5MrKFJirarDtQo3Zn+EK1UrO2WBpFatFCo1zPGCTzfFThcuvrrPxnLUmcgYeT5YWiNRMKEODUPxoZcpV0vPSg2dpqjU2sFL+A21RnVq06oMS8e9paMHOuVoB/BBqkJC9TquI09wmUqu2+JRzGj5NFttjuqnylqty1lXwVdrshNFhamhBqW6y7Yrm6+V05zuIzn8CSH38gN9fAf1vIAjEWsHWCREqTLgIkaJEixErTrz1EiRKssFGyaBSwMClQkBCSYOGkQ4LJ0MmPAIiEjIKKho6hixM2VjYcnBw8fAJCImISUjJyCkoqahp5MqTr4CWTqEixUqUKlOugp6BMWvAXj16XTbtF32Gbfeaw/bFH2xzU7cJjz0xlAAw4B13PTLriGee+suc4z7wvhMqVRll8pFqyz70mY994lO/MvvK575wksWfxlz1tW9YPfCbQXY2NerUctjNqd4mNxKXfhbcmt23mUeLVlu0+Z89tmrXodNDv1twzSmnEwiuu+OGM8664KJ3nXPee/oddcUbLiUIeP0RyBrVzQqFL/+GwKaHbXg8F994BVvzKDqRx1/zv4vxmk4kEigAAAA=';

const ESTILO_PADRAO = {
  fonte: { familia: 'Poppins', arquivo: null, peso: 700 }, // arquivo: .ttf/.otf/.woff2 da marca
  tamanho: 78,                 // px em tela de 1920 de altura (escala automática)
  corTexto: '#FFFFFF',
  corDestaque: '#AAFF00',
  corPilula: null,             // cor do fundo da pílula (destaque: 'pilula'); padrão = corDestaque
  corTextoPilula: '#000000',
  destaque: 'cor',             // 'cor' | 'pilula' | 'sublinhado' | 'nenhum'  (COMO destacar)
  modoDestaque: 'falada',      // O QUE destacar: 'falada' (palavra sendo dita) | 'chave' (palavras-chave do plano,
                               // o card inteiro) | 'ambos' (chave com o estilo + palavra dita na cor)
  caixa: 'original',           // 'original' | 'alta' | 'baixa'
  palavrasPorCard: 3,
  maxCaracteres: 18,
  proximasOpacidade: 0.55,     // palavras ainda não faladas (1 = sem diferença)
  contorno: 5,                 // px de contorno preto (0 = sem)
  sombra: true,
  pop: 1.1,                    // escala da palavra ativa ao entrar (1 = sem pop)
  entrada: 'pop',              // entrada do card: 'pop' | 'subir' | 'nenhuma'
  centroY: 1330,               // centro vertical do bloco (px em 1920). Zona segura do Reels: 1150–1420
  larguraMax: 0.86,            // fração da largura da tela
  antecipacao: 0.06,           // s — destaque um pouco antes do som parece mais natural
  pausaNovoCard: 0.6,          // s de silêncio entre palavras que força card novo

  // ── RECRIAR O VISUAL DA REFERÊNCIA ───────────────────────────────────────────
  // Este arquivo é só o MOTOR (tempo, cards, animação). O visual deve ser recriado a partir da referência.
  // Caixa atrás do card inteiro (legenda "em caixa"):
  fundoCard: null,             // cor do fundo do card (ex.: '#002C57'); null = sem caixa
  opacidadeCard: 1,            // 0–1 (só para cores #RRGGBB)
  raioCard: 10,                // px de borda arredondada (em 1920 de altura)
  padCardX: 22,                // px de respiro horizontal dentro da caixa
  padCardY: 6,                 // px de respiro vertical dentro da caixa
  bordaCard: null,             // { cor: '#FFFFFF', largura: 2 }
  // CSS livre, aplicado POR ÚLTIMO: para tudo que os campos acima não cobrem (gradiente, sublinhado fino,
  // caixa por palavra, letter-spacing, sombra de caixa...). Seletores: #box (o card), .w (cada palavra),
  // .w.ativa (palavra dita), .w.prox (ainda não dita). Valores em px na escala de 1920 de altura.
  cssExtra: '',
};

// '#RRGGBB' + opacidade → 'rgba(...)'; qualquer outro formato de cor passa direto
function corComOpacidade(cor, op) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(cor || '').trim());
  if (!m || op == null || op >= 1) return cor;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, op)})`;
}

function aplicarCaixa(w, caixa) {
  if (caixa === 'alta') return w.toLocaleUpperCase('pt-BR');
  if (caixa === 'baixa') return w.toLocaleLowerCase('pt-BR');
  return w; // original: mantém exatamente a grafia corrigida (ChatGPT, WhatsApp, IA)
}

const normP = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w%]+/g, '');

// Marca as palavras que fazem parte das palavras-chave (expressões de 1+ palavras, como foram faladas)
function marcarChaves(palavras, chaves) {
  const alvos = (chaves || []).map(k => String(k).split(/\s+/).map(normP).filter(Boolean)).filter(a => a.length);
  const n = palavras.map(w => normP(w.word));
  for (const a of alvos) for (let i = 0; i + a.length <= n.length; i++) {
    if (a.every((t, j) => n[i + j] === t)) {
      for (let j = 0; j < a.length; j++) palavras[i + j].chave = true;
      palavras[i].chaveLen = Math.max(palavras[i].chaveLen || 0, a.length);   // início da expressão
      palavras[i].chaveTxt = palavras.slice(i, i + a.length).map(w => w.word).join(' ');
    }
  }
}

function montarCards(segmentos, est, limites, duracaoTotal, chaves) {
  const palavras = [];
  for (const s of segmentos || []) for (const w of s.words || []) {
    const txt = String(w.word || '').trim();
    if (txt) palavras.push({ word: txt, start: +w.start, end: +w.end });
  }
  palavras.sort((a, b) => a.start - b.start);
  marcarChaves(palavras, chaves);
  const lims = (limites || []).slice().sort((a, b) => a - b);
  const cruzaLimite = (a, b) => lims.some(l => a < l - 0.02 && b > l + 0.02);

  const cards = [];
  let cur = [];
  const fechar = () => { if (cur.length) cards.push({ words: cur }); cur = []; };
  for (const w of palavras) {
    if (cur.length) {
      const ult = cur[cur.length - 1];
      const txt = cur.map(x => x.word).concat(w.word).join(' ');
      // não separa uma expressão-chave entre dois cards (ex.: "tempos exatos"):
      // se a expressão inteira não cabe no card atual, ela começa um card novo
      const juntaChave = ult.chave && w.chave && !w.chaveLen;
      const naoCabe = w.chaveLen > 1 && (cur.length + w.chaveLen > est.palavrasPorCard ||
        (cur.map(x => x.word).join(' ') + ' ' + w.chaveTxt).length > est.maxCaracteres);
      if (naoCabe || (!juntaChave && (cur.length >= est.palavrasPorCard || txt.length > est.maxCaracteres)) ||
          w.start - ult.end > est.pausaNovoCard || cruzaLimite(ult.start, w.start)) fechar();
    }
    cur.push(w);
    if (/[.!?;:,]$/.test(w.word) && cur.length >= 2) fechar();
    else if (/[.!?]$/.test(w.word)) fechar();
  }
  fechar();

  cards.forEach((c, i) => {
    c.start = c.words[0].start;
    const prox = cards[i + 1] ? cards[i + 1].words[0].start : duracaoTotal;
    let fim = Math.min(prox, c.words[c.words.length - 1].end + 0.45);
    const lim = lims.find(l => l > c.start + 0.02);
    if (lim !== undefined) fim = Math.min(fim, lim);
    c.end = fim;
    c.words = c.words.map(w => ({ ...w, word: aplicarCaixa(w.word, est.caixa) }));
  });
  return cards;
}

function fonteFace(fonte) {
  if (fonte && fonte.arquivo && fs.existsSync(fonte.arquivo)) {
    const ext = path.extname(fonte.arquivo).slice(1).toLowerCase();
    const fmt = { ttf: 'truetype', otf: 'opentype', woff: 'woff', woff2: 'woff2' }[ext] || 'truetype';
    const b64 = fs.readFileSync(fonte.arquivo).toString('base64');
    return `@font-face{font-family:'${fonte.familia}';src:url(data:font/${ext};base64,${b64}) format('${fmt}');font-weight:${fonte.peso || 700};font-display:block}`;
  }
  return `@font-face{font-family:'Poppins';src:url(data:font/woff2;base64,${POPPINS_BOLD_B64}) format('woff2');font-weight:700;font-display:block}`;
}

function gerarHTMLLegenda(segmentos, duracaoTotal, opcoes = {}) {
  const largura = opcoes.largura || 1080;
  const altura = opcoes.altura || 1920;
  const esc = altura / 1920;
  const est = { ...ESTILO_PADRAO, ...(opcoes.estilo || {}) };
  // Legenda em caixa: o contorno preto e a sombra do texto são do estilo "sem caixa". Com caixa, ficam
  // desligados, a menos que a referência peça (aí informe contorno/sombra no estilo).
  if (est.fundoCard) {
    if ((opcoes.estilo || {}).contorno === undefined) est.contorno = 0;
    if ((opcoes.estilo || {}).sombra === undefined) est.sombra = false;
  }
  if (opcoes.corDestaque && !(opcoes.estilo && opcoes.estilo.corDestaque)) est.corDestaque = opcoes.corDestaque; // compat. v2
  est.fonte = { ...ESTILO_PADRAO.fonte, ...((opcoes.estilo || {}).fonte || {}) };
  if (!est.fonte.arquivo || !fs.existsSync(est.fonte.arquivo)) est.fonte = { ...ESTILO_PADRAO.fonte };

  const cards = montarCards(segmentos, est, opcoes.limites, duracaoTotal, opcoes.palavrasChave);
  const fs_ = Math.round(est.tamanho * esc);
  const c = Math.round(est.contorno * esc);
  const sombra = [];
  if (c > 0) for (let a = 0; a < 16; a++) {
    const r = (a / 16) * Math.PI * 2;
    sombra.push(`${(Math.cos(r) * c).toFixed(1)}px ${(Math.sin(r) * c).toFixed(1)}px 0 #000`);
  }
  if (est.sombra) sombra.push(`0 ${Math.round(6 * esc)}px ${Math.round(14 * esc)}px rgba(0,0,0,.65)`);
  const shadow = sombra.length ? sombra.join(',') : 'none';
  const corPil = est.corPilula || est.corDestaque;

  // Caixa atrás do card inteiro: o #box encolhe ao tamanho do texto (max-content) e ganha fundo/respiro/borda
  const larguraBox = Math.round(largura * est.larguraMax);
  const cssCaixa = est.fundoCard
    ? `#box{width:max-content;max-width:${larguraBox}px;background:${corComOpacidade(est.fundoCard, est.opacidadeCard)};` +
      `padding:${Math.round(est.padCardY * esc)}px ${Math.round(est.padCardX * esc)}px;border-radius:${Math.round(est.raioCard * esc)}px;` +
      (est.bordaCard && est.bordaCard.cor ? `border:${Math.max(1, Math.round((est.bordaCard.largura || 2) * esc))}px solid ${est.bordaCard.cor};` : '') + `}`
    : '';
  const cssLivre = String(est.cssExtra || '').replace(/<\/style/gi, '');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<style>
${fonteFace(est.fonte)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent;width:${largura}px;height:${altura}px;overflow:hidden}
#box{position:absolute;left:50%;top:${Math.round(est.centroY * esc)}px;width:${Math.round(largura * est.larguraMax)}px;
  transform:translate(-50%,-50%);text-align:center;font-family:'${est.fonte.familia}','Arial Black',Arial,sans-serif;
  font-weight:${est.fonte.peso || 700};font-size:${fs_}px;line-height:1.22;color:${est.corTexto};text-shadow:${shadow}}
.w{display:inline-block;margin:0 ${Math.round(fs_ * 0.13)}px;transform-origin:50% 60%;white-space:nowrap}
.w.prox{opacity:${est.proximasOpacidade}}
.w.ativa.cor{color:${est.corDestaque}}
.w.ativa.pilula{background:${corPil};color:${est.corTextoPilula};text-shadow:none;border-radius:${Math.round(fs_ * 0.18)}px;padding:0 ${Math.round(fs_ * 0.16)}px}
.w.ativa.chavecor{color:${est.corDestaque}}
.w.ativa.sublinhado{text-decoration:underline;text-decoration-color:${est.corDestaque};text-decoration-thickness:${Math.round(fs_ * 0.1)}px;text-underline-offset:${Math.round(fs_ * 0.12)}px}
${cssCaixa}
${cssLivre}
</style></head>
<body><div id="box"></div>
<script>
(function(){
  var CARDS = ${JSON.stringify(cards)};
  var MODO = ${JSON.stringify(est.modoDestaque || 'falada')};
  var DEST = ${JSON.stringify(est.destaque)}, POP = ${est.pop}, ENTR = ${JSON.stringify(est.entrada)}, ANT = ${est.antecipacao};
  var box = document.getElementById('box'), atual = -1, spans = [];
  function easeOut(x){ x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); }
  function popCurve(x){ if (x <= 0) return 0; if (x >= 1) return 1; return 1 + 0.18 * Math.sin(x * Math.PI); }
  window.render = function(t){
    var ci = -1;
    for (var i = 0; i < CARDS.length; i++) { if (t >= CARDS[i].start - ANT && t < CARDS[i].end) { ci = i; break; } }
    if (ci !== atual) {
      atual = ci; box.innerHTML = ''; spans = [];
      if (ci >= 0) CARDS[ci].words.forEach(function(w){ var s = document.createElement('span'); s.className = 'w'; s.textContent = w.word; box.appendChild(s); spans.push(s); });
    }
    if (ci < 0) { box.style.opacity = 0; window.__chaveQuadro = 'vazio'; return; }
    var card = CARDS[ci], dt = t - (card.start - ANT), chave = ci + '|';
    box.style.opacity = 1;
    var sc = ENTR === 'pop' ? 0.88 + 0.12 * easeOut(dt / 0.12) : 1;
    var dy = ENTR === 'subir' ? 18 * (1 - easeOut(dt / 0.15)) : 0;
    box.style.transform = 'translate(-50%,-50%) translateY(' + dy + 'px) scale(' + sc + ')';
    chave += dy + '|' + sc;
    for (var k = 0; k < card.words.length; k++) {
      var w = card.words[k], s = spans[k];
      var ativa = t >= w.start - ANT && (k === card.words.length - 1 || t < card.words[k + 1].start - ANT);
      var passada = !ativa && t >= w.start - ANT;
      var cls = '';
      if (DEST !== 'nenhum') {
        if (MODO === 'falada') cls = ativa ? ' ativa ' + DEST : '';
        else if (w.chave && (ativa || passada)) cls = ' ativa ' + DEST;          // chave: fica destacada depois de dita
        else if (MODO === 'ambos' && ativa) cls = ' ativa chavecor';
      }
      s.className = 'w' + cls + (!ativa && !passada ? ' prox' : '');
      var p = ativa && POP > 1 ? 1 + (POP - 1) * (1 - easeOut((t - (w.start - ANT)) / 0.14)) : 1;
      s.style.transform = 'scale(' + p.toFixed(3) + ')';
      chave += '|' + s.className + '@' + p.toFixed(3);
    }
    // Tudo o que muda a imagem está na chave: se ela se repete, o quadro é idêntico ao anterior (a Dafne reaproveita a foto)
    window.__chaveQuadro = chave;
  };
  window.render(0);
})();
</script></body></html>`;
}

module.exports = { gerarHTMLLegenda, montarCards, ESTILO_PADRAO };
