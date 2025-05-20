import React, { useEffect, useRef } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './custom-code-styles.module.css';

/**
 * A custom wrapper around Docusaurus CodeBlock component that ensures
 * comments are properly styled as non-bold while code stays bold
 */
export function CustomCodeBlock({ children, language, ...props }) {
  const codeBlockRef = useRef(null);
  const { colorMode } = useColorMode(); // Get current theme (light/dark)

  // We use useEffect to apply DOM manipulation after the component has rendered
  useEffect(() => {
    if (codeBlockRef.current) {
      // Find all comment tokens and ensure they're not bold
      const commentNodes = codeBlockRef.current.querySelectorAll(
        '.token.comment, .prism-code .comment, span.comment, .token.block-comment, .token.line-comment, .token.prolog'
      );

      // Choose comment color based on theme
      const commentColor = colorMode === 'dark' ? '#a0a0a0' : '#717171';      
      // Apply non-bold styling to each comment token
      commentNodes.forEach(node => {
        node.style.fontWeight = 'normal';
        node.style.fontStyle = 'italic';
        node.style.opacity = '0.85';
        node.style.color = commentColor;
      });

      // Apply background color to code blocks only in light mode
      if (colorMode === 'light') {
        const codeBlockElements = codeBlockRef.current.querySelectorAll(
          '.prism-code, pre, div[class*="codeBlockContainer"]'
        );
        
        codeBlockElements.forEach(node => {
          node.style.backgroundColor = 'rgb(249, 245, 245)';
        });
      }
    }
  }, [children, language, colorMode]); // Re-run the effect if the code, language, or theme changes

  return (
    <div ref={codeBlockRef} className={styles.codeBlockBold}>
      <CodeBlock language={language} {...props}>
        {children}
      </CodeBlock>
    </div>
  );
}

export default CustomCodeBlock;
