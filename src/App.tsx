import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Terminal } from './components/Terminal';
import { ArticleViewer } from './components/ArticleViewer';
import { WebViewer } from './components/WebViewer';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { AdminToolbar } from './components/AdminToolbar';
import { AuthProvider } from './contexts/AuthContext';
import { Article, ResearchCategory } from './types/Article';
import { articlesApi } from './services/api';

function AppContent() {
  const [currentMode, setCurrentMode] = useState<'terminal' | 'viewer' | 'web' | 'admin'>('terminal');
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [categories, setCategories] = useState<ResearchCategory[]>([]);
  const [selectedCategoryForWeb, setSelectedCategoryForWeb] = useState<ResearchCategory | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Define base categories structure
  const getBaseCategories = (): ResearchCategory[] => [
    {
      slug: 'market_research',
      name: 'Market Research',
      description: 'Quantitative analysis and trading insights',
      articles: []
    },
    {
      slug: 'economic_indicators',
      name: 'Economic Indicators',
      description: 'Key economic data and analysis',
      articles: []
    },
    {
      slug: 'bookshelf',
      name: 'Bookshelf',
      description: 'Investment and finance books',
      articles: []
    }
  ];

  // Load articles from API and update categories
  const loadArticlesFromAPI = async () => {
    try {
      const articles = await articlesApi.getAll();
      
      // Group articles by category
      const articlesByCategory = articles.reduce((acc: Record<string, Article[]>, article: Article) => {
        if (!acc[article.category]) {
          acc[article.category] = [];
        }
        acc[article.category].push(article);
        return acc;
      }, {} as Record<string, Article[]>);

      // Get base categories and populate with articles
      const baseCategories = getBaseCategories();
      const populatedCategories = baseCategories.map(category => ({
        ...category,
        articles: articlesByCategory[category.slug] || []
      }));

      setCategories(populatedCategories);
    } catch (error) {
      console.error('Failed to load articles from API:', error);
      // Fallback to base categories without articles
      setCategories(getBaseCategories());
    }
  };

  // Load articles on component mount
  useEffect(() => {
    loadArticlesFromAPI();
  }, []);

  const getCurrentDirectory = (): ResearchCategory | null => {
    if (currentPath === '/') return null;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    return categories.find(cat => cat.slug === pathParts[0]) || null;
  };

  const handleCommand = (command: string): string => {
    const [cmd, ...args] = command.trim().split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'help':
        return `Available commands:
  help          - Show this help message
  ls [path]     - List directories and articles
  cd <path>     - Change directory (enters web interface for categories)
  cat <file>    - View article
  pwd           - Show current directory
  tree          - Show directory structure
  find <term>   - Search articles by title or content
  web           - Switch to web interface
  about         - About Relaxed Constraints
  clear         - Clear terminal screen

Note: Use 'cd <category>' to enter a category and automatically switch to web interface.`;

      case 'ls':
        const targetPath = args[0] || currentPath;
        
        if (targetPath === '/' || targetPath === '') {
          return categories.map(cat => 
            `${cat.slug.padEnd(20)} - ${cat.name} (${cat.articles.length} articles)`
          ).join('\n');
        }
        
        const currentDir = getCurrentDirectory();
        if (!currentDir) {
          return 'Directory not found.';
        }
        
        return currentDir.articles.map((article, index) => 
          `${String(index + 1).padStart(2, '0')} - ${article.title} (${new Date(article.date).toLocaleDateString()})`
        ).join('\n');

      case 'cd':
        if (!args[0]) {
          return 'Usage: cd <directory>';
        }
        
        if (args[0] === '..') {
          setCurrentPath('/');
          return '';
        }
        
        if (args[0] === '/' || args[0] === '~') {
          setCurrentPath('/');
          return '';
        }
        
        const targetCategory = categories.find(cat => cat.slug === args[0]);
        if (!targetCategory) {
          return `Directory '${args[0]}' not found.`;
        }
        
        // Switch to web interface when entering a category
        setSelectedCategoryForWeb(targetCategory);
        setCurrentMode('web');
        return '';

      case 'pwd':
        return currentPath === '/' ? '/' : currentPath;

      case 'tree':
        let treeOutput = '/\n';
        categories.forEach((cat, index) => {
          const isLast = index === categories.length - 1;
          const prefix = isLast ? '└── ' : '├── ';
          treeOutput += `${prefix}${cat.slug}/ (${cat.articles.length} articles)\n`;
          
          cat.articles.forEach((article, articleIndex) => {
            const isLastArticle = articleIndex === cat.articles.length - 1;
            const articlePrefix = isLast ? '    ' : '│   ';
            const articleSymbol = isLastArticle ? '└── ' : '├── ';
            treeOutput += `${articlePrefix}${articleSymbol}${article.title}\n`;
          });
        });
        return treeOutput;

      case 'cat':
        if (!args[0]) {
          return 'Usage: cat <article_number>';
        }
        
        const articleCategory = getCurrentDirectory();
        if (!articleCategory) {
          return 'No articles in root directory. Use cd to navigate to a category first.';
        }
        
        const articleIndex = parseInt(args[0]) - 1;
        if (articleIndex < 0 || articleIndex >= articleCategory.articles.length) {
          return `Article ${args[0]} not found.`;
        }
        
        setCurrentArticle(articleCategory.articles[articleIndex]);
        setCurrentMode('viewer');
        return '';

      case 'find':
        if (!args[0]) {
          return 'Usage: find <search_term>';
        }
        
        const searchTerm = args.join(' ').toLowerCase();
        const results: string[] = [];
        
        categories.forEach(cat => {
          cat.articles.forEach((article, index) => {
            if (article.title.toLowerCase().includes(searchTerm) || 
                article.content.toLowerCase().includes(searchTerm)) {
              results.push(`${cat.slug}/${index + 1} - ${article.title}`);
            }
          });
        });
        
        if (results.length === 0) {
          return `No articles found containing '${searchTerm}'.`;
        }
        
        return `Found ${results.length} article(s):\n${results.join('\n')}`;

      case 'about':
        return `RELAXED CONSTRAINTS - Research Portfolio
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A curated collection of research articles covering:
• Equity Analysis - Deep dives into market trends and stock analysis
• Economic News - Commentary on macroeconomic developments  
• Market Research - Quantitative analysis and trading insights
• Financial Theory - Academic perspectives on market behavior

Navigate using standard Unix commands (ls, cd, cat, find)
Type 'tree' to see the full directory structure
Type 'help' for available commands

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      case 'web':
        setSelectedCategoryForWeb(null);
        setCurrentMode('web');
        return '';

      case 'clear':
        return 'CLEAR';

      default:
        return `Command not found: ${cmd}. Type 'help' for available commands.`;
    }
  };

  const handleBackToTerminal = () => {
    setCurrentMode('terminal');
    setCurrentArticle(null);
  };

  const handleBackToTerminalFromWeb = () => {
    setCurrentMode('terminal');
    setCurrentArticle(null);
    setSelectedCategoryForWeb(null);
  };

  const handleArticleAdded = async () => {
    try {
      // Article was already created by the component, just reload to ensure consistency
      await loadArticlesFromAPI();
    } catch (error) {
      console.error('Failed to reload articles:', error);
    }
  };

  const handleArticleUpdated = async (article: Article) => {
    try {
      await articlesApi.update(article.id, article);
      // Reload articles from API to ensure consistency
      await loadArticlesFromAPI();
    } catch (error) {
      console.error('Failed to update article:', error);
    }
  };

  const handleArticleDeleted = async () => {
    try {
      // Article was already deleted by the component that called this
      // Just reload articles from API to ensure consistency
      await loadArticlesFromAPI();
    } catch (error) {
      console.error('Failed to reload articles:', error);
    }
  };

  const getPrompt = () => {
    const pathDisplay = currentPath === '/' ? '~' : `~${currentPath}`;
    return `visitor@relaxed-constraints:${pathDisplay}$`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      {/* CRT Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent animate-pulse"></div>
        <div className="absolute inset-0" style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          )`
        }}></div>
      </div>

      {/* Admin Toolbar */}
      <AdminToolbar 
        onShowLogin={() => setShowLoginModal(true)} 
        onShowAdminDashboard={() => setCurrentMode('admin')}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />

      {currentMode === 'terminal' && (
        <Terminal onCommand={handleCommand} prompt={getPrompt()} />
      )}

      {currentMode === 'viewer' && currentArticle && (
        <ArticleViewer
          article={currentArticle}
          onBack={handleBackToTerminal}
        />
      )}

      {currentMode === 'web' && (
        <WebViewer
          categories={categories}
          onBackToTerminal={handleBackToTerminalFromWeb}
          initialCategory={selectedCategoryForWeb}
          onArticleAdded={() => handleArticleAdded()}
          onArticleUpdated={handleArticleUpdated}
          onArticleDeleted={handleArticleDeleted}
          onArticleSelect={(article) => {
            setCurrentArticle(article);
            setCurrentMode('viewer');
          }}
        />
      )}

      {currentMode === 'admin' && (
        <AdminDashboard
          categories={categories}
          onBack={() => setCurrentMode('terminal')}
          onArticleAdded={() => handleArticleAdded()}
          onArticleUpdated={handleArticleUpdated}
          onArticleDeleted={handleArticleDeleted}
        />
      )}

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;