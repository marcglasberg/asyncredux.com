import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from "@docusaurus/Link";
import Markdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import {useEffect, useState} from "react";

const FeatureList = [
  {
    title: 'For React',
    Svg: require('@site/static/img/react.svg').default,
    description: (
      <>
        On&nbsp;<a
        href='https://www.npmjs.com/package/async-redux-react'>npm</a>&nbsp;since&nbsp;July&nbsp;2024
      </>
    ),
    page: 'react',
  },
  {
    title: 'For Flutter',
    Svg: require('@site/static/img/flutter.svg').default,
    description: (
      <>
        On&nbsp;<a href='https://pub.dev/packages/async_redux'>pub.dev</a>&nbsp;since&nbsp;Aug 2019
      </>
    ),
    page: 'flutter',
  },
];

function Feature({Svg, title, page, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img"/>
      </div>
      <div className={styles.getStartedTextAndLogo}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Link
          className="button button--primary button--lg"
          style={{marginBottom: 50}}
          to={`/${page}/intro`}>
          Get Started
        </Link>
      </div>
    </div>
  );
}

export function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row" style={{display: 'flex', justifyContent: 'center'}}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MarkdownFile({filename, marginTop, width}) {
  const [post, setPost] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add this line

  useEffect(() => {
    setIsLoading(true);
    fetch(`landing-page-md/${filename}`)
      .then(response => response.text())
      .then(data => {
        setIsLoading(false);
        setPost(data);
      })
      .catch(err => {
        setIsLoading(false);
        console.log(err);
      });
  }, [filename]);

  if (isLoading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      height: '4000px'
    }}>
      Loading...
    </div>;
  } else
    return (
      <div className="container" style={{marginTop: marginTop, width: width}}>
        <Markdown
          children={post}
          components={{
            pre({children}) {
              return children
            },
            code(props) {
              const {children, className, node, ...rest} = props
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <SyntaxHighlighter
                  {...rest}
                  // showLineNumbers={true}
                  // wrapLines ={true}
                  // wrapLongLines ={true}
                  PreTag="pre"
                  children={String(children).replace(/\n$/, '')}
                  language={match[1]}
                  // style={dark}
                  style={prism}
                />
              ) : (
                <code {...rest} className={className}>
                  {children}
                </code>
              )
            }
          }}
        />
      </div>
    );
}

export function Overview(page) {
  const [activeTab, setActiveTab] = useState('react');

  return (
    <div>
      <div className={styles.sticky}>
        <div className={styles.whiteBkg}>
          <div className={styles.tabContainer}>
            <button className={clsx(styles.tab, {[styles.tabSelected]: activeTab === 'react'})}
                    onClick={() => setActiveTab('react')}>React
            </button>
            <button className={clsx(styles.tab, {[styles.tabSelected]: activeTab === 'flutter'})}
                    onClick={() => setActiveTab('flutter')}>Flutter
            </button>
          </div>
          <hr className={styles.divider}></hr>
          <div style={{height: 15}}></div>
        </div>
        <div className={styles.gradient}></div>
      </div>

      <section className={styles.features}>

        <div className="container">
          {activeTab === 'react' && (
            <div className={styles.overview}>
              <MarkdownFile filename="overview-react.md"/>
            </div>
          )}
          {activeTab === 'flutter' && (
            <div className={styles.overview}>
              <MarkdownFile filename="overview-flutter.md"/>
            </div>
          )}

          <div style={{height: 40}}></div>
          <center>
            <iframe
              src="https://codesandbox.io/embed/j57yz5?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.0&editorsize=75&previewwindow=browser"
              style={{maxWidth: '90%', width: '680px', height: '450px', border: '3px solid #AAA', borderRadius: '4px'}}
              title="counter-async-redux-example"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          </center>

          <div style={{
            display: 'flex',
            width: '100%',
            maxWidth: 670,
            margin: '20px auto 0 auto',
            justifyContent: 'right'
          }}>
            <Link
              className="button button--primary button--lg"
              style={{marginBottom: 5, alignItems: 'center'}}
              to={`/${activeTab}/intro`}>
              <span style={{display: 'inline-block', transform: 'translateY(-6px)'}}>
                Get Started &nbsp;<span style={{
                fontSize: 30,
                display: 'inline-block',
                transform: 'translateY(2px)'
              }}>»</span>
              </span>
            </Link>
          </div>
          <p>&nbsp;</p>
        </div>
      </section>
    </div>
  );
}

const prism = {
  "pre": {
    "margin": "0",
    "padding": "0",
    "overflow": "auto",
    "background": "blue",
  },
  "code[class*=\"language-\"]": {
    "color": "black",
    "background": "none",
    "textShadow": "0",
    "fontFamily": "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    "fontSize": "1em",
    "textAlign": "left",
    "whiteSpace": "pre",
    "wordSpacing": "normal",
    "wordBreak": "normal",
    "wordWrap": "normal",
    "lineHeight": "1.3",
    "MozTabSize": "4",
    "OTabSize": "4",
    "tabSize": "4",
    "WebkitHyphens": "none",
    "MozHyphens": "none",
    "msHyphens": "none",
    "hyphens": "none"
  },
  "pre[class*=\"language-\"]": {
    "color": "black",
    "background": "#F9F5F5",
    "textShadow": "0",
    "fontFamily": "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    "fontSize": "1em",
    "fontWeight": "600",
    "textAlign": "left",
    "whiteSpace": "pre",
    "wordSpacing": "normal",
    "wordBreak": "normal",
    "wordWrap": "normal",
    "lineHeight": "1.5",
    "MozTabSize": "4",
    "OTabSize": "4",
    "tabSize": "4",
    "WebkitHyphens": "none",
    "MozHyphens": "none",
    "msHyphens": "none",
    "hyphens": "none",
    "padding": "0.75em 1em",
    "margin": ".5em 0",
    "overflow": "auto"
  },
  "pre[class*=\"language-\"]::-moz-selection": {
    "textShadow": "none",
    "background": "#b3d4fc"
  },
  "pre[class*=\"language-\"] ::-moz-selection": {
    "textShadow": "none",
    "background": "#b3d4fc"
  },
  "code[class*=\"language-\"]::-moz-selection": {
    "textShadow": "none",
    "background": "#b3d4fc"
  },
  "code[class*=\"language-\"] ::-moz-selection": {
    "textShadow": "none",
    "background": "#b3d4fc"
  },
  "pre[class*=\"language-\"]::selection": {
    "textShadow": "none",
    "background": "#b3d4fc"
  },
  "pre[class*=\"language-\"] ::selection": {
    "textShadow": "none",
    "background": "#b3d4fc"
  },
  "code[class*=\"language-\"]::selection": {
    "textShadow": "none",
    "background": "#b3d4fc"
  },
  "code[class*=\"language-\"] ::selection": {
    "textShadow": "none",
    "background": "#b3d4fc"
  },
  ":not(pre) > code[class*=\"language-\"]": {
    "background": "#f5f2f0",
    "padding": ".1em",
    "borderRadius": ".3em",
    "whiteSpace": "normal"
  },
  "comment": {
    "color": "#999",
    "fontWeight": "400",
  },
  "prolog": {
    "color": "slategray"
  },
  "doctype": {
    "color": "slategray"
  },
  "cdata": {
    "color": "slategray"
  },
  "punctuation": {
    "color": "#888"
  },
  "namespace": {
    "Opacity": ".7"
  },
  "property": {
    "color": "#905"
  },
  "tag": {
    "color": "#905"
  },
  "boolean": {
    "color": "#905"
  },
  "number": {
    "color": "#905"
  },
  "constant": {
    "color": "#905"
  },
  "symbol": {
    "color": "#905"
  },
  "deleted": {
    "color": "#905"
  },
  "selector": {
    "color": "#690"
  },
  "attr-name": {
    "color": "#690"
  },
  "string": {
    "color": "#690"
  },
  "char": {
    "color": "#690"
  },
  "builtin": {
    "color": "#690"
  },
  "inserted": {
    "color": "#690"
  },
  "operator": {
    "color": "#9a6e3a",
    "background": "hsla(0, 0%, 100%, .5)"
  },
  "entity": {
    "color": "#9a6e3a",
    "background": "hsla(0, 0%, 100%, .5)",
    "cursor": "help"
  },
  "url": {
    "color": "#9a6e3a",
    "background": "hsla(0, 0%, 100%, .5)"
  },
  ".language-css .token.string": {
    "color": "#9a6e3a",
    "background": "hsla(0, 0%, 100%, .5)"
  },
  ".style .token.string": {
    "color": "#9a6e3a",
    "background": "hsla(0, 0%, 100%, .5)"
  },
  "atrule": {
    "color": "#07a"
  },
  "attr-value": {
    "color": "#07a"
  },
  "keyword": {
    "color": "#07a"
  },
  "function": {
    "color": "#DD4A68"
  },
  "class-name": {
    "color": "#DD4A68"
  },
  "regex": {
    "color": "#e90"
  },
  "important": {
    "color": "#e90",
    "fontWeight": "bold"
  },
  "variable": {
    "color": "#e90"
  },
  "bold": {
    "fontWeight": "bold"
  },
  "italic": {
    "fontStyle": "italic"
  }
};
