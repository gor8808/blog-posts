// https://github.com/GoogleChromeLabs/quicklink
import { listen } from 'quicklink/dist/quicklink.mjs';

// Delay quicklink to free up main thread during initial load
const initQuicklink = () => {
    listen({
        ignores: [
            /\/api\/?/,
            uri => uri.includes('.zip'),
            (uri, elem) => elem.hasAttribute('noprefetch'),
            (uri, elem) => elem.hash && elem.pathname === window.location.pathname,
        ]
    });
};

if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initQuicklink());
} else {
    setTimeout(initQuicklink, 2000);
}

// https://github.com/aFarkas/lazysizes/tree/gh-pages/plugins/native-loading
import lazySizes from 'lazysizes';
import 'lazysizes/plugins/native-loading/ls.native-loading';

lazySizes.cfg.nativeLoading = {
    setLoadingAttribute: true,
    disableListeners: {
        scroll: true
    }
};
