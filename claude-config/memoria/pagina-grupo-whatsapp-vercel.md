---
name: pagina-grupo-whatsapp-vercel
description: "Página ponte do grupo de ofertas no Vercel (valotaparfum-grupo.vercel.app), usada no anúncio do Facebook porque ele recusa o link direto do WhatsApp"
metadata:
  node_type: memory
  type: reference
  originSessionId: 4c9b5d23-a3e2-4168-b51e-2776b9339f10
  modified: 2026-11-25T13:12:44.958Z
---

25/11/2026: página simples com a foto do perfil (frasco verde), cores petróleo + âmbar, Montserrat e botão "Entrar no grupo gratuito" que leva pro link do grupo (chat.whatsapp.com/IpapnNqakmQJilcfKIi7jM).

- Endereço: https://valotaparfum-grupo.vercel.app
- Arquivos: `valotaparfum-grupo/` (index.html, osiany.jpg, og.jpg). Projeto Vercel separado "valotaparfum-grupo"; o site antigo "valotaparfum" (site-valota/) NÃO foi mexido.
- Publicar mudança: dentro da pasta, `npx -y vercel@latest deploy --prod --yes`.

- 25/11: versão final aprovada ("deu certo") e JÁ ESTÁ NO ANÚNCIO. Chamada "Quer perfume original sem pagar caro?", fala de árabes, designers e nicho, botão na 1ª tela até em tela de 664 px (navegador do Facebook). Nunca apagar/renomear o projeto nem trocar o endereço; mudança = publicar no mesmo projeto.

**Why:** o Facebook Ads não aceita o link chat.whatsapp.com direto, então o anúncio aponta pra essa página. Liga com [[cta-grupo-whatsapp-ofertas]] e [[video-trafego-pago-grupo-v84]].

**How to apply:** se o link do grupo mudar, trocar o href do botão no index.html e publicar de novo.
