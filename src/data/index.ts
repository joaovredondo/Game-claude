/**
 * Ponto único de acesso aos dados data-driven do jogo.
 * Importa os JSON de /data (fonte da verdade) e os valida contra os schemas.
 * Qualquer erro de schema estoura aqui, no carregamento do módulo.
 */
import raritiesJson from '../../data/rarities.json';
import refinementJson from '../../data/refinement.json';
import itemsJson from '../../data/items.sample.json';
import { parseRarities, parseRefinement, parseItems } from '../core/data/load';

export const rarities = parseRarities(raritiesJson);
export const refinement = parseRefinement(refinementJson);
export const itemDefs = parseItems(itemsJson);
