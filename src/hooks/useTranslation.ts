import { useStore } from '../store/store';
import { translations } from '../translations';
import type { LanguageCode } from '../translations';

export function useTranslation() {
    const currentProductId = useStore(state => state.currentProductId);
    const products = useStore(state => state.products);

    let language: LanguageCode = 'pt';

    if (currentProductId) {
        const product = products.find(p => p.id === currentProductId);
        if (product && product.language) {
            language = product.language as LanguageCode;
        }
    } else if (products.length > 0) {
        // Fallback: se nenhum produto selecionado ainda (ex: na Home), tenta o idioma do primeiro produto disponível
        // Isso resolve o problema de carregar em PT se o único produto for em EN
        const firstProd = products[0];
        if (firstProd.language) {
            language = firstProd.language as LanguageCode;
        }
    }

    const t = (key: keyof typeof translations['pt']) => {
        return translations[language][key] || translations['pt'][key] || key;
    };

    console.log(`DEBUG LANG: ProductID=${currentProductId} | ChosenLanguage=${language}`);

    return { t, language };
}
