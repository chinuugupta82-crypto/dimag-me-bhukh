/* Describes every editable part of the website. Used by admin.js to draw the forms. */
(function () {
  function F(k, label, type, extra) { return Object.assign({ k: k, label: label, type: type || 'text' }, extra || {}); }
  var TEXT_HELP = 'Blank line = new paragraph. Use *italic*, **bold** and [link text](https://address).';
  var TS = [F('title', 'Title'), F('sub', 'Short line under the title', 'textarea', { rows: 2 })];
  function cards(label, name, extra) {
    return F('items', label, 'list', Object.assign({ itemName: name, itemTitle: 'title', item: [F('title', 'Title'), F('text', 'Text', 'textarea', { rows: 5, help: TEXT_HELP })] }, extra || {}));
  }
  window.ADMIN_SCHEMA = [
    { id: 'site', icon: '⚙️', label: 'Site settings', preview: null, root: 'site',
      help: 'Basic details used all over the website. Change the email, social links and the words Google shows.',
      fields: [
        F('brand', 'Site name'), F('founder', 'Founder / author name'),
        F('email', 'Contact email (visitors\u2019 ideas are sent here)'),
        F('facebook', 'Facebook link'), F('youtube', 'YouTube link'),
        F('youtubeChannelId', 'YouTube channel ID (starts with UC)', 'text', { help: 'Already filled in for your channel. It lets the newest video show on the home page by itself. Leave it as it is.' }),
        F('instagram', 'Instagram link', 'text', { help: 'Leave empty to hide Instagram.' }),
        F('domain', 'Website address (fill in after launch)', 'text', { help: 'For example https://dimagmebhukh.com . Needed for Google and link previews. Leave empty until the site is live.' }),
        F('seoTitle', 'Page title for Google (about 55 characters)'),
        F('seoDescription', 'Description for Google (about 150 characters)', 'textarea', { rows: 3 }),
        F('altNames', 'Other spellings of the name (one per line)', 'lines', { rows: 4 })
      ] },
    { id: 'menu', icon: '☰', label: 'Menu & section order', preview: null, root: null,
      help: 'The words in the pop-up menu. The order here is also the order of the sections on the website: move an entry up or down and its section moves too. Home always stays first. Do not change the section codes.',
      fields: [F('menu', 'Menu entries', 'list', { itemTitle: 'label', itemName: 'entry', fixed: true, item: [F('id', 'Section code (do not change)'), F('label', 'Menu text')] })] },
    { id: 'hero', icon: '🏠', label: 'Home (top of page)', preview: 'top', root: 'hero',
      help: 'The first thing visitors see.',
      fields: [F('eyebrow', 'Small line above the headline'), F('title', 'Headline', 'textarea', { rows: 2 }), F('tagline', 'Tagline'), F('intro', 'Intro text', 'textarea', { rows: 4 }), F('image', 'Main photo', 'image')] },
    { id: 'about', icon: '👤', label: 'About', preview: 'about', root: 'about',
      help: 'The founder\u2019s note. ' + TEXT_HELP,
      fields: [F('title', 'Section title'), F('nameNote', 'Note about the name', 'textarea', { rows: 3 }), F('lead', 'Lead line'), F('paragraphs', 'Main text', 'textarea', { rows: 14, help: TEXT_HELP }),
        F('quote', 'Closing quote', 'textarea', { rows: 3 }), F('thanks', 'Thank-you line'), F('sigWith', 'Signature start (e.g. With gratitude,)'), F('sigName', 'Signature name'), F('sigRole', 'Signature role')] },
    { id: 'journey', icon: '🗺️', label: 'My 3-Year Journey', preview: 'journey', root: 'journey', help: 'The story, one chapter at a time. Add as many chapters as you like.',
      fields: TS.concat([cards('Chapters', 'chapter')]) },
    { id: 'observed', icon: '👀', label: 'What I Have Observed', preview: 'observed', root: 'observed', help: 'Personal observations. Each one is a card.',
      fields: TS.concat([cards('Observations', 'observation'), F('pull', 'Highlighted quote'), F('pullBy', 'Who said it / when')]) },
    { id: 'invite', icon: '🏡', label: 'How to Invite Sparrows', preview: 'invite', root: 'invite', help: 'Numbered steps. The numbers are added automatically.',
      fields: TS.concat([cards('Steps', 'step'), F('note', 'Note under the steps', 'textarea', { rows: 2 })]) },
    { id: 'indepth', icon: '🔍', label: 'In Depth', preview: 'indepth', root: 'indepth', help: 'Longer topics with photos. The \u201Ccode\u201D is used by links in the Knowledge Hub, so keep it unless you also change the link there.',
      fields: TS.concat([F('items', 'Topics', 'list', { itemName: 'topic', itemTitle: 'title', autoId: true, item: [F('id', 'Code (for links, e.g. t-food)'), F('title', 'Title'), F('text', 'Text', 'textarea', { rows: 5, help: TEXT_HELP }), F('bullets', 'Key points (one per line)', 'lines', { rows: 4 }), F('images', 'Photos', 'images')] })]) },
    { id: 'babies', icon: '🐣', label: 'Babies & Nesting', preview: 'babies', root: 'babies', help: 'Questions and answers about chicks and nests.',
      fields: TS.concat([F('images', 'Photos', 'images'), cards('Questions', 'question'),
        F('fine', 'Box: probably fine', 'group', { item: [F('label', 'Heading'), F('bullets', 'Points (one per line)', 'lines', { rows: 4 }), F('text', 'Advice', 'textarea', { rows: 3 })] }),
        F('help', 'Box: needs help', 'group', { item: [F('label', 'Heading'), F('bullets', 'Points (one per line)', 'lines', { rows: 4 }), F('text', 'Advice', 'textarea', { rows: 3 })] })]) },
    { id: 'myths', icon: '❓', label: 'Myths vs Facts', preview: 'myths', root: 'myths', help: 'Add a new myth any time. Then add its proof under \u201CProof and sources\u201D below.',
      fields: TS.concat([
        F('items', 'Myths and facts', 'list', { itemName: 'myth', itemTitle: 'myth', item: [F('myth', 'Myth', 'textarea', { rows: 2 }), F('fact', 'Fact', 'textarea', { rows: 6, help: TEXT_HELP })] }),
        F('obs', 'Highlighted \u201Cfrom our observation\u201D box', 'group', { item: [F('tag', 'Label'), F('myth', 'Myth', 'textarea', { rows: 2 }), F('fact', 'Fact', 'textarea', { rows: 6, help: TEXT_HELP }), F('caveat', 'Small note', 'textarea', { rows: 3 })] }),
        F('proof', 'Proof and sources', 'group', { item: [F('title', 'Heading'), F('note', 'Intro', 'textarea', { rows: 3 }),
          F('cards', 'Claims and links', 'list', { itemName: 'claim', itemTitle: 'claim', item: [F('claim', 'Claim', 'textarea', { rows: 2 }), F('text', 'What the sources say (your own words)', 'textarea', { rows: 5 }),
            F('links', 'Links', 'list', { itemName: 'link', itemTitle: 'label', item: [F('label', 'Link text'), F('url', 'Web address')] })] }),
          F('general', 'General reading line', 'textarea', { rows: 3, help: 'Use [text](https://address) for links.' }), F('disclaimer', 'Closing note', 'textarea', { rows: 2 })] })]) },
    { id: 'balcony', icon: '🌿', label: 'Sparrow-Friendly Home', preview: 'balcony', root: 'balcony', help: 'Practical tips, seasons and the checklist.',
      fields: TS.concat([F('items', 'Tips', 'list', { itemName: 'tip', itemTitle: 'title', item: [F('icon', 'Emoji'), F('title', 'Title'), F('text', 'Text', 'textarea', { rows: 4 })] }),
        F('images', 'Photos', 'images'), F('seasonsTitle', 'Seasons heading'),
        F('seasons', 'Seasons', 'list', { itemName: 'season', itemTitle: 'title', item: [F('icon', 'Emoji'), F('title', 'Title'), F('text', 'Text', 'textarea', { rows: 3 })] }),
        F('checkTitle', 'Checklist heading'), F('checklist', 'Checklist items (one per line)', 'lines', { rows: 8 }), F('checkHint', 'Line under the checklist')]) },
    { id: 'rescue', icon: '🆘', label: 'Rescue & Help', preview: 'rescue', root: 'rescue', help: 'Safety guidance. Have a wildlife rescuer or avian vet check this text.',
      fields: TS.concat([cards('Guidance', 'guidance'), F('disclaimer', 'Disclaimer', 'textarea', { rows: 3 })]) },
    { id: 'stories', icon: '📖', label: 'Stories', preview: 'stories', root: 'stories', help: 'Short stories about the sparrow family. A photo is optional; otherwise the emoji is shown.',
      fields: TS.concat([F('items', 'Stories', 'list', { itemName: 'story', itemTitle: 'title', item: [F('icon', 'Emoji'), F('title', 'Title'), F('text', 'Story', 'textarea', { rows: 6, help: TEXT_HELP }), F('image', 'Photo (optional)', 'image', { optional: true })] })]) },
    { id: 'posts', icon: '📝', label: 'Blog (write here)', preview: 'blog', root: null,
      help: 'Write your blog posts here. Set a post to \u201CPublished\u201D and press Publish to website: it appears in the Blog section on the home page (newest first) and gets its own page. Drafts stay private.',
      fields: [
        F('posts', 'Blog posts', 'list', { itemName: 'post', itemTitle: 'title', itemBadge: 'status', previewPost: true, item: [
          F('status', 'Status (choose Published to show it on the website)', 'select', { options: [['draft', 'Draft (not on the website)'], ['published', 'Published (on the website)']], default: 'draft' }),
          F('title', 'Title'),
          F('slug', 'Page name in the web address', 'text', { help: 'Letters, numbers and dashes only. It is made from the title for you.' }),
          F('date', 'Date', 'date', { default: 'today' }),
          F('category', 'Category', 'text', { help: 'For example: Food and feeding. Posts with the same category can be filtered together.' }),
          F('excerpt', 'Short summary (shown on cards and Google)', 'textarea', { rows: 3 }),
          F('cover', 'Cover photo (optional)', 'image', { optional: true }),
          F('body', 'The post', 'richtext', { rows: 18 })
        ] }),
        F('blog', 'Blog section settings', 'group', { item: [
          F('title', 'Heading on the home page'), F('sub', 'Line under the heading', 'textarea', { rows: 2 }),
          F('homeCount', 'How many posts to show on the home page', 'number', { default: 3 }), F('viewAll', 'Button text: all blog posts'),
          F('indexTitle', 'Heading of the all-blog-posts page'), F('indexSub', 'Line under that heading', 'textarea', { rows: 2 }), F('emptyText', 'Message shown until the first post is published', 'textarea', { rows: 3 })
        ] })
      ] },
    { id: 'updates', icon: '🎬', label: 'Latest Updates (YouTube)', preview: 'updates', root: 'updates',
      help: 'Shows your newest YouTube video near the top of the home page. It changes by itself when you upload a new video. You can also add a few videos of your own choice below it.',
      fields: [
        F('show', 'Show this section on the website', 'select', { options: [['yes', 'Yes, show it'], ['no', 'No, hide it']], default: 'yes' }),
        F('title', 'Heading'), F('sub', 'Line under the heading', 'textarea', { rows: 2 }),
        F('videosTitle', 'Heading above the extra videos'),
        F('videos', 'Extra videos (optional)', 'list', { itemName: 'video', itemTitle: 'title', item: [
          F('title', 'Video title'),
          F('url', 'YouTube link', 'text', { help: 'Copy the address of the video from YouTube and paste it here. Normal links, youtu.be links and Shorts links all work.' })
        ] }),
        F('watchText', 'Button text: all videos'), F('subscribeText', 'Button text: subscribe')
      ] },
    { id: 'connect', icon: '📱', label: 'Social media section', preview: 'connect', root: 'connect', help: 'The buttons come from the links in Site settings.', fields: TS },
    { id: 'idea', icon: '💡', label: 'Share Your Idea', preview: 'idea', root: 'idea', help: 'Visitors\u2019 ideas open their email app addressed to your email. Write {email} where your address should appear.',
      fields: TS.concat([F('steps', 'How it works (one step per line)', 'lines', { rows: 4 }), F('note', 'Safety note', 'textarea', { rows: 3 })]) },
    { id: 'contact', icon: '✉️', label: 'Contact', preview: 'contact', root: 'contact', help: 'The buttons come from Site settings.', fields: TS },
    { id: 'hub', icon: '📚', label: 'Knowledge Hub', preview: 'hub', root: 'hub', help: 'Topic cards that jump to a section of the page. \u201CJumps to\u201D must be a section code, such as invite, babies, myths, rescue, blog or a topic code from In Depth.',
      fields: TS.concat([F('cards', 'Cards', 'list', { itemName: 'card', itemTitle: 'label', item: [F('icon', 'Emoji'), F('label', 'Card text'), F('target', 'Jumps to (section code)')] })]) }
  ];
  /* Sidebar order: writing tools first, then the page from top to bottom (the same order as the website), then settings. */
  (function (S) {
    var ORDER = [['posts', 'Write'], ['updates', 'Write'],
      ['hero', 'Page, top to bottom'], ['about', 'Page, top to bottom'], ['journey', 'Page, top to bottom'], ['observed', 'Page, top to bottom'], ['hub', 'Page, top to bottom'],
      ['invite', 'Page, top to bottom'], ['balcony', 'Page, top to bottom'], ['indepth', 'Page, top to bottom'], ['babies', 'Page, top to bottom'], ['myths', 'Page, top to bottom'],
      ['rescue', 'Page, top to bottom'], ['stories', 'Page, top to bottom'], ['connect', 'Page, top to bottom'], ['idea', 'Page, top to bottom'], ['contact', 'Page, top to bottom'],
      ['site', 'Settings'], ['menu', 'Settings']];
    var out = ORDER.map(function (o) { var sec = S.filter(function (x) { return x.id === o[0]; })[0]; sec.group = o[1]; return sec; });
    S.length = 0; out.forEach(function (x) { S.push(x); });
  })(window.ADMIN_SCHEMA);

})();
