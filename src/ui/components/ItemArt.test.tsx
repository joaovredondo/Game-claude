import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import ItemArt from './ItemArt';

// jsdom não carrega imagens de verdade: o <img> nunca dispara onLoad/onError
// sozinho. Os testes abaixo simulam os dois caminhos manualmente.

afterEach(() => cleanup());

describe('ItemArt', () => {
  it('sem icon (slot vazio): renderiza só o fallback, sem <img> e sem glow de raridade', () => {
    const { container } = render(<ItemArt slot="wings" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.boxShadow).toBe('');
  });

  it('com icon: renderiza a <img>; ao disparar onLoad ela fica visível (opacity-100)', () => {
    const { container } = render(
      <ItemArt icon="teste_carrega" slot="weapon" weaponType="sword" rarity="epic" />,
    );
    const img = container.querySelector('img')!;
    expect(img).not.toBeNull();
    expect(img.className).toContain('opacity-0');

    fireEvent.load(img);
    expect(img.className).toContain('opacity-100');
  });

  it('com icon: ao disparar onError, esconde a <img> e mantém o fallback com glow de raridade', () => {
    const { container } = render(
      <ItemArt icon="teste_falha_unico" slot="chest" rarity="legendary" />,
    );
    const img = container.querySelector('img')!;
    fireEvent.error(img);

    // Após a falha, o componente para de tentar renderizar a <img>.
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.boxShadow).not.toBe('');
  });

  it('cacheia falhas: um icon que já falhou não tenta a rede de novo em um novo mount', () => {
    const { container: primeiro } = render(<ItemArt icon="teste_cache" slot="chest" />);
    fireEvent.error(primeiro.querySelector('img')!);
    cleanup();

    const { container: segundo } = render(<ItemArt icon="teste_cache" slot="chest" />);
    expect(segundo.querySelector('img')).toBeNull();
  });
});
