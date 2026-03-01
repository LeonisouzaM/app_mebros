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
    }

    const t = (key: keyof typeof translations['pt']) => {
        return translations[language][key] || translations['pt'][key] || key;
    };

    return { t, language };
}
