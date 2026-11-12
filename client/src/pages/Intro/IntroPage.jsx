import { useEffect } from 'react';
import introDocument from './IntroDocument.html?raw';
import { introPageConfig } from './page.config.js';
import './IntroPage.css';

/**
 * Intro landing page.
 * The adapted original HTML lives beside this component in IntroDocument.html.
 * Keeping it local to this page makes copy and layout edits easy to find.
 */
export default function IntroPage() {
  useEffect(() => {
    document.title = introPageConfig.documentTitle;
  }, []);

  return (
    <main className="intro-page-host" aria-label={introPageConfig.accessibleName}>
      <iframe
        className="intro-page-frame"
        srcDoc={introDocument}
        title={introPageConfig.accessibleName}
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
