import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import MDXContent from './overview-flutter.mdx';
import CustomCodeBlock from './CustomCodeBlock';
import styles from './overview-styles.module.css';

// Custom components for MDX rendering
const components = {
  pre: (props) => <div {...props} />,
  code: (props) => {
    const { children, className, node, ...rest } = props;
    
    // If this is a code block (has a language-xxx className)
    if (className && className.startsWith('language-')) {
      const language = className.replace(/language-/, '');
      return (
        <CustomCodeBlock language={language}>
          {children}
        </CustomCodeBlock>
      );
    }
    
    // Otherwise, it's inline code, render it with regular styling
    return <code {...rest} className={className}>{children}</code>;
  }
};

export default function OverviewContent() {
  return (
    <MDXProvider components={components}>
      <MDXContent />
    </MDXProvider>
  );
}
