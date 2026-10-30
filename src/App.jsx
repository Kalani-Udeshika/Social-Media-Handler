import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import './App.css';

const client = generateClient();

const orchidImages = {
  hero: 'https://images.unsplash.com/photo-1566907225472-514a9a0d5f50?auto=format&fit=crop&w=1400&q=85',
  pink: 'https://images.unsplash.com/photo-1566944999267-7a5d7b4e5b4c?auto=format&fit=crop&w=800&q=80',
  purple: 'https://images.unsplash.com/photo-1564844536308-5d7c2b6c7f5d?auto=format&fit=crop&w=800&q=80',
  white: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=800&q=80',
};

const sampleContent = [
  {
    id: 1,
    type: 'Image',
    title: 'Elegant Purple Orchids',
    description: 'Bring natural beauty into every corner with these stunning blooms.',
    image: orchidImages.hero,
    tag: 'Featured',
  },
  {
    id: 2,
    type: 'Post',
    title: 'Make Every Bloom Special',
    description:
      'Looking for a gift that speaks from the heart? Our beautiful orchids are perfect for every special moment. 🌸',
    image: orchidImages.pink,
    tag: 'Marketing idea',
  },
  {
    id: 3,
    type: 'Video',
    title: 'A Little Orchid Inspiration',
    description:
      'Explore the beauty of orchids and discover inspiration for your next post.',
    image: orchidImages.purple,
    tag: 'Video idea',
  },
  {
    id: 4,
    type: 'Image',
    title: 'Fresh White Orchids',
    description: 'Simple, elegant and timeless. Let your flowers tell the story.',
    image: orchidImages.white,
    tag: 'New inspiration',
  },
];

const navigation = [
  { name: 'Home' , icon: '⌂' },
  { name: 'Images', icon: '▧' },
  { name: 'Videos', icon: '▷' },
  { name: 'Posts', icon: '▤' },
  //{ name: 'Generate Content', icon: '✦' },
];

function App() {
  const [activePage, setActivePage] = useState('Home');
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('Social media post');
  const [generatedText, setGeneratedText] = useState('');
  const [savedItems, setSavedItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredContent = sampleContent.filter((item) => {
    const matchesPage =
      activePage === 'Home' ||
      activePage === 'Generate Content' ||
      item.type === activePage.slice(0, -1) ||
      (activePage === 'Posts' && item.type === 'Post');

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    return matchesPage && matchesSearch;
  });

  function handleGenerate() {
    if (!topic.trim()) {
      setGeneratedText('Please enter a topic before generating content.');
      return;
    }

    // Sample output for the UI preview.
    // We will connect this button to your AWS Lambda function next.
    setGeneratedText(
      `🌸 ${topic.trim()} 🌸\n\nBring more beauty to your day with our stunning orchids! Discover the colours, elegance and natural charm that make every bloom special.\n\n✨ Find your favourite orchid today!\n\n#Orchids #OrchidLovers #FlowerBusiness`
    );
  }

  function toggleSaved(id) {
    setSavedItems((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id]
    );
  }

  function navigateTo(page) {
    setActivePage(page);
    setMobileMenuOpen(false);
    setSearch('');
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <button
          className="brand"
          onClick={() => navigateTo('Home')}
          aria-label="Go to home"
        >
          <span className="brand-icon">✿</span>
          <span>
            <strong>Orchid</strong>
            <small>CONTENT CREATOR</small>
          </span>
        </button>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? 'nav-item-active' : ''
              }`}
              onClick={() => navigateTo(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {item.name === 'Generate Content' && (
                <span className="nav-sparkle">✦</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="tip-card">
            <span className="tip-icon">🌱</span>
            <h3>Grow something beautiful</h3>
            <p>Great content helps your orchid business bloom.</p>
            {/* <button onClick={() => navigateTo('Generate Content')}>
              Create content <span>→</span>
            </button> */}
          </div>

          {/* <div className="profile">
            <div className="profile-avatar">O</div>
            <div className="profile-details">
              <strong>Orchid Studio</strong>
              <small>Content workspace</small>
            </div>
            <span className="profile-menu">•••</span>
          </div> */}
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <span className="status-dot" />
            <span className="workspace-status">Your creative space</span>
            <button
              className="top-create-button"
              onClick={() => navigateTo('Generate Content')}
            >
              <span>＋</span> Create content
            </button>
          </div>
        </header>

        <div className="page-content">
          {activePage === 'Home' && (
            <>
              <section className="welcome-section">
                <div className="welcome-copy">
                  <span className="eyebrow">
                    <span>✦</span> YOUR ORCHID CONTENT STUDIO
                  </span>
                  <h1>
                    Grow your orchid
                    <br />
                    business with <em>better content.</em>
                  </h1>
                  <p>
                    Discover creative ideas, create beautiful posts and help
                    your orchid business bloom online.
                  </p>
                   {/* <div className="welcome-actions">
                    <button
                      className="primary-button"
                      onClick={() => navigateTo('Generate Content')}
                    >
                      <span>✦</span> Generate content
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => navigateTo('Images')}
                    >
                      Explore inspiration <span>→</span>
                    </button>
                  </div> */}
                  <div className="welcome-note">
                    <span>✿</span> Made for orchid lovers and growers
                  </div>
                </div> 

                <div className="welcome-image">
                  <img src={orchidImages.hero} alt="Beautiful orchid flowers" />
                  <div className="image-caption">
                    <span className="caption-flower">✿</span>
                    <span>
                      <strong>Nature's finest</strong>
                      <small>Inspiration for your next post</small>
                    </span>
                    <span className="caption-arrow">↗</span>
                  </div>
                  <div className="floating-flower">✿</div>
                </div>
              </section>

              <section className="quick-stats">
                <div className="stat-item">
                  <span className="stat-icon lavender">▧</span>
                  <div>
                    <strong>Image ideas</strong>
                    <small>Visual inspiration</small>
                  </div>
                  <button onClick={() => navigateTo('Images')}>Explore →</button>
                </div>
                <div className="stat-item">
                  <span className="stat-icon peach">▷</span>
                  <div>
                    <strong>Video ideas</strong>
                    <small>Tell your story</small>
                  </div>
                  <button onClick={() => navigateTo('Videos')}>Explore →</button>
                </div>
                <div className="stat-item">
                  <span className="stat-icon green">✎</span>
                  <div>
                    <strong>Post ideas</strong>
                    <small>Connect with customers</small>
                  </div>
                  <button onClick={() => navigateTo('Posts')}>Explore →</button>
                </div>
              </section>
            </>
          )}

          {activePage === 'Generate Content' && (
            <section className="generator-panel">
              <span className="eyebrow">
                <span>✦</span> YOUR CREATIVE ASSISTANT
              </span>
              <h1>Let's create something beautiful.</h1>
              <p className="page-description">
                Start with an idea. Create content that helps your orchid
                business stand out.
              </p>

              <div className="generator-form">
                <label htmlFor="content-type">What would you like to create?</label>
                <select
                  id="content-type"
                  value={contentType}
                  onChange={(event) => setContentType(event.target.value)}
                >
                  <option>Social media post</option>
                  <option>Marketing caption</option>
                  <option>Image idea</option>
                  <option>Video idea</option>
                  <option>Product description</option>
                </select>

                <label htmlFor="topic">Tell us about your idea</label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Example: Promote our beautiful purple orchids for a special occasion..."
                  rows={5}
                />

                <button className="primary-button generate-button" onClick={handleGenerate}>
                  <span>✦</span> Generate {contentType.toLowerCase()}
                </button>

                {generatedText && (
                  <div className="generated-result">
                    <div className="result-heading">
                      <strong>Your content preview</strong>
                      <button
                        className="copy-button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(generatedText);
                          }
                        }}
                      >
                        Copy text
                      </button>
                    </div>
                    <p>{generatedText}</p>
                    <small>
                      Preview only — AI generation will be connected to AWS
                      Lambda in the next step.
                    </small>
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage !== 'Generate Content' && (
            <section className="feed-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE ORCHID COLLECTION</span>
                  <h2>
                    {activePage === 'Home'
                      ? 'Explore your inspiration'
                      : activePage === 'Images'
                        ? 'Orchid images'
                        : activePage === 'Videos'
                          ? 'Orchid videos'
                          : activePage === 'Posts'
                            ? 'Social media posts'
                            : activePage}
                  </h2>
                  <p>
                    {activePage === 'Home'
                      ? 'Fresh ideas to help your next creation bloom.'
                      : `Discover ${activePage.toLowerCase()} for your orchid business.`}
                  </p>
                </div>

                <div className="feed-controls">
                  <label className="search-box">
                    <span>⌕</span>
                    <input
                      type="search"
                      placeholder="Search inspiration..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="content-feed">
                {filteredContent.length > 0 ? (
                  filteredContent.map((item) => (
                    <article className="content-card" key={item.id}>
                      <div className="content-image">
                        <img src={item.image} alt={item.title} />
                        <span className="content-tag">{item.tag}</span>
                        {item.type === 'Video' && (
                          <span className="play-button">▶</span>
                        )}
                      </div>

                      <div className="content-card-body">
                        <div className="content-type">{item.type} inspiration</div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <div className="content-card-actions">
                          <button
                            className="text-button"
                            onClick={() => navigateTo('Generate Content')}
                          >
                            Create something similar <span>→</span>
                          </button>
                          <button
                            className={`save-button ${
                              savedItems.includes(item.id) ? 'is-saved' : ''
                            }`}
                            onClick={() => toggleSaved(item.id)}
                            aria-label={
                              savedItems.includes(item.id)
                                ? 'Remove saved item'
                                : 'Save item'
                            }
                          >
                            {savedItems.includes(item.id) ? '♥' : '♡'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    <span>🌸</span>
                    <h3>No matching inspiration found</h3>
                    <p>Try another search term.</p>
                  </div>
                )}
              </div>

              <div className="feed-footer">
                <span>✿</span> A little inspiration goes a long way.
              </div>
            </section>
          )}

          <footer className="page-footer">
            <span>© 2026 Orchid Content Creator</span>
            <span>Made to help your business bloom <span className="footer-flower">✿</span></span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'
// import { generateClient } from 'aws-amplify/data';

// const client = generateClient();

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>MY</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           my Count is  {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
