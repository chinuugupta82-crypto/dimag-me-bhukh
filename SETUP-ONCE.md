# One-time setup (about 30 minutes, done once by you)

After this, Akanksha edits her website in the admin panel and presses **Publish**. The website updates by itself in about a minute. No downloading or uploading.

How it works: the website files live in a free GitHub repository, and a free host (GitHub Pages or Netlify) shows them as a website. The admin panel saves your changes straight into that repository, and the host updates the website.

## 1. Make the GitHub account and repository
1. Go to github.com and create a free account (for example with the website's Gmail). Keep this login safe.
2. Click **New repository**. Name it `dimag-me-bhukh`. Choose **Public**. Click **Create repository**.
3. In the new repository click **Add file → Upload files**. Unzip the website folder on your computer, open it, select everything inside (all files and folders) and drag them in. Click **Commit changes**.

## 2. Turn on the website
Pick **one**.

**A. GitHub Pages (free, simplest)**
1. Repository **Settings → Pages**.
2. Under "Build and deployment" choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and Save.
3. After a minute or two the address appears: `https://YOUR-USER-NAME.github.io/dimag-me-bhukh/`.

**B. Netlify (free, also simple)**
1. At netlify.com choose **Add new site → Import an existing project**, connect GitHub and pick the repository.
2. Leave the build command empty and the publish folder as `.`, then Deploy. Every change saved to the repository then updates the website by itself.

## 3. Use the real domain (optional, can be done later)
In GitHub Pages (or Netlify) enter the custom domain, then at the place that manages the domain's DNS (for a WordPress.com domain: Domains → Manage → DNS records) add the records that GitHub or Netlify tells you to add. Follow their current on-screen instructions, because the exact values can change. After the domain works, open the admin panel, go to **Site settings**, fill in **Website address**, and Publish.

## 4. Create the secret key that lets the admin publish
1. On GitHub click your profile picture → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name: `Website admin`. Expiration: choose the longest allowed (you must make a new key when it expires).
3. **Repository access:** Only select repositories → choose `dimag-me-bhukh`.
4. **Permissions → Repository permissions → Contents:** set to **Read and write**.
5. Click **Generate token** and copy it now (it starts with `github_pat_`). GitHub shows it only once.

## 5. Connect the admin panel
1. Open `YOUR-WEBSITE/admin/` and click **Connect to publish**.
2. Fill in: GitHub user name, repository `dimag-me-bhukh`, branch `main`, the secret key. Leave the folder empty.
3. Click **Test connection**. You should see a green "Connected". Click **Save**.
4. To set up Akanksha's computer, click **Create a code to share**, send her that code privately (not on a public page), and on her computer she opens the admin, clicks **Connect to publish**, pastes the code, presses **Fill in from code**, then **Save**.

## 6. Try it
Change a word, press **Publish to website**, wait about a minute, and refresh the website.

## Safety notes
- The secret key is kept only in the browser it was entered in. Anyone who has the key or the code can publish, so share it only with Akanksha.
- If the key is lost or shared by mistake, delete it on GitHub (Settings → Developer settings → Fine-grained tokens) and make a new one.
- The repository is public, like the website. Do not put private information in the content.
- Every Publish is saved by GitHub as a version. **Admin → More → Older versions** can bring one back.
- If Publish says "key not accepted" or "no permission", the key has expired or was made without Contents: Read and write.

## Putting a new version of the website files online (when you receive an updated ZIP)
Publish from the admin only sends the content (index.html, content.js, posts, photos). New features also change the code files, so those are uploaded once by hand:
1. In the admin choose **More → Download ZIP (backup)** first, so nothing you published recently is lost.
2. Unzip the new ZIP. On GitHub open your repository, **Add file → Upload files**, drag in everything (all files and the `admin` and `images` folders) and **Commit changes**.
3. Wait a minute, open `/admin/` and press Ctrl + F5. Your saved draft and connection stay in the browser.
Note: this replaces `content.js` and `index.html`. If you published changes after this ZIP was made, they are kept in GitHub's history (More → Older versions) but not on the site, so tell whoever updates the site before uploading.
