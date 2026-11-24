# ---------- transição "zoom pelo frasco" (só movimento de câmera, nada por cima) ----------
# A câmera mergulha no frasco que sai (zoom acelerando + giro leve + borrão radial de velocidade),
# corta no pico e o frasco novo chega já ampliado, desacelera até a mão parar, com um
# pequeno tranco de pouso. Sem luz, sem cor, sem camada por cima: só a imagem se movendo.
PONTO = (540, 930)                       # centro do frasco na tela (o zoom acontece em volta dele)
ANTES, DEPOIS = 3, 7                     # quadros de transição antes/depois do corte
ZOOM_SAI, ZOOM_ENTRA = 0.42, 0.36        # quanto amplia no mergulho / de quanto o novo parte
GIRO_SAI, GIRO_ENTRA = 2.2, -2.6         # graus

def ease_in(q): return q ** 2.4
def ease_out(q): return 1 - (1 - q) ** 3.2

def estado(seg, n):
    """fator de zoom extra f, giro extra e tranco (dx,dy) da foto `seg` no quadro n"""
    f, g, jx, jy = 1.0, 0.0, 0.0, 0.0
    k = n - CORTES[seg]
    if seg > 0 and 0 <= k < DEPOIS:                          # chegando
        q = (k + 1) / (DEPOIS + 1)
        r = 1 - ease_out(q)
        f = 1 + ZOOM_ENTRA * r
        g = GIRO_ENTRA * r
    if seg > 0 and 0 <= k < 10:                              # tranco de pouso, some rápido
        a = math.exp(-k / 2.2)
        jx = 5 * a * math.sin(k * 2.1 + 0.6)
        jy = 7 * a * math.cos(k * 1.7)
    fim = CORTES[seg + 1]
    if seg < 5 and 0 < fim - n <= ANTES:                     # saindo (mergulha no frasco)
        q = (ANTES - (fim - n) + 1) / (ANTES + 1)
        f = 1 + ZOOM_SAI * ease_in(q)
        g = GIRO_SAI * ease_in(q)
    return f, g, jx, jy

def pose_em(seg, n_frac):
    """pose completa num tempo fracionário (pro borrão de obturador)"""
    n0 = math.floor(n_frac); fr = n_frac - n0
    e0, e1 = estado(seg, n0), estado(seg, n0 + 1)
    # não interpolar atravessando o corte
    if seg > 0 and n0 + 1 == CORTES[seg]:
        e0 = e1
    if n0 + 1 == CORTES[seg + 1]:
        e1 = e0
    f, g, jx, jy = (a + (b - a) * fr for a, b in zip(e0, e1))
    t = max(n_frac - CORTES[seg], 0) / FPS
    dx, dy, rot, zoom = balanco(seg, t)
    # zoom em volta do frasco: o ponto PONTO fica parado na tela
    ox, oy = W / 2 + dx, H / 2 + dy
    ox = PONTO[0] + f * (ox - PONTO[0]); oy = PONTO[1] + f * (oy - PONTO[1])
    return (ox - W / 2 + jx, oy - H / 2 + jy, rot + g, zoom * f), f

def render_foto(seg, n):
    """média de sub-quadros ao longo do 'obturador' = borrão radial/rotacional de verdade"""
    p0, f0 = pose_em(seg, n)
    pa, fa = pose_em(seg, n - 0.5)
    pb, fb = pose_em(seg, n + 0.5)
    mov = abs(fb - fa) * 1000 + abs(pb[2] - pa[2]) * 40 + math.hypot(pb[0] - pa[0], pb[1] - pa[1])
    if mov < 8:
        return np.asarray(quadro(FOTO[seg], *p0), dtype=np.float32)
    passos = int(min(24, 8 + mov / 12))
    acc = np.zeros((H, W, 3), np.float32)
    for i in range(passos):
        u = n - 0.42 + 0.84 * i / (passos - 1)            # obturador de ~300°
        acc += np.asarray(quadro(FOTO[seg], *pose_em(seg, u)[0]), dtype=np.float32)
    return acc / passos

def render(n):
    seg = max(i for i, c in enumerate(CORTES) if c <= n)
    if seg == 6:
        base = np.zeros((H, W, 3), np.float32)
    else:
        base = render_foto(seg, n)
