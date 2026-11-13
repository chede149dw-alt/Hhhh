// Dados do cenário distribuidora (puro, sem three): usado pelo diretor no Node e pelo cenário no navegador.
export const SALA = { x0: -2.2, x1: 2.2, z0: -3.0, z1: 1.2, teto: 2.9 };
export const GRADE_Z = 1.2;
export const PORTINHOLA = { x: -0.55, base: 1.0, l: 0.3, a: 0.3 };
export const BALCAO = { x0: -1.6, x1: 0.5, z0: 0.62, z1: 1.1, altura: 1.0 };

// Marcas: onde os atores ficam (x, z, giro em graus; giro 0 = olhando para +z).
export const MARCAS = {
  balcao: { x: PORTINHOLA.x, z: 0.3, giro: 0, livre: 0.5, desc: 'Eduardo atrás do balcão, de frente para a portinhola' },
  geladeira: { x: -0.92, z: 0.05, giro: 0, livre: 0.6, desc: 'Eduardo diante da geladeira (à direita dele)' },
  engradado: { x: 1.3, z: -0.6, giro: -63, livre: 1.6, desc: 'Gabriel sentado no engradado, virado para o balcão' },
  cadeado: { x: 0.74, z: 0.73, giro: 0, livre: 1.0, desc: 'Gabriel em pé no portão, mão no cadeado' },
  portinhola: { x: PORTINHOLA.x, z: GRADE_Z + 0.72, giro: 180, livre: 2.5, desc: 'Cliente do lado de fora, na frente da portinhola' },
  rua: { x: PORTINHOLA.x + 0.3, z: 9.5, giro: 180, livre: 3, desc: 'Cliente longe, no escuro da rua' },
};
export const CADEADO = [0.66, 1.02, GRADE_Z - 0.03];

