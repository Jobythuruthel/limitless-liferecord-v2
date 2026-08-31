# Go live — the actual steps, no dev skills needed

This gets the JOBY AI Limitless Liferecord app hosted online, for free, at a real URL you can open from any device. It's about 20 minutes of clicking through free signups. I can't create these accounts for you — that's the one boundary I hold everywhere, since it means typing your credentials — but everything below is copy-paste-and-click.

## 1. Put the code on GitHub (5 min)

1. Go to github.com, create a free account if you don't have one.
2. Click "New repository." Name it `limitless-liferecord`. Keep it Private. Create it.
3. On your own computer, unzip the file I sent you, then in that folder run:
   ```
   git init
   git add .
   git commit -m "initial"
   git remote add origin <the URL GitHub shows you>
   git push -u origin main
   ```
   If you don't have `git` installed or this step is confusing, tell me — I can do this part from my side once you've connected this session to your computer, since it's just file upload, not a credential.

## 2. Create the database (5 min)

1. Go to neon.tech, sign up free (or supabase.com — either works, Neon is simpler).
2. Create a new project. It gives you a connection string that looks like:
   `postgresql://user:password@host/dbname?sslmode=require`
3. Copy that whole string. You'll paste it into Vercel in step 3.

## 3. Deploy on Vercel (5 min)

1. Go to vercel.com, sign up free using your GitHub account (one click, "Continue with GitHub").
2. Click "Add New" → "Project" → pick the `limitless-liferecord` repo.
3. Before clicking Deploy, open "Environment Variables" and add these:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Neon/Supabase connection string from step 2 |
   | `NEXTAUTH_SECRET` | `bvxsh67QCMqk78ywcwTXRYWh4kcwF+fEBEKPbNxeFec=` |
   | `NEXTAUTH_URL` | leave blank for now, you'll set it after step 4 |

   (This secret was generated fresh just now for you — it's not used anywhere else, safe to use as-is.)

4. Click Deploy. Vercel builds it and gives you a URL like `limitless-liferecord.vercel.app`.
5. Go back into Environment Variables, set `NEXTAUTH_URL` to that exact URL (with `https://`), then redeploy (Vercel → Deployments → the three dots on the latest one → Redeploy).

## 4. Set up the database tables (2 min)

In Vercel, go to your project → Settings → and open a "Deploy Hook" or use the built-in terminal — actually, simplest: on your own computer, in the project folder, run:
```
DATABASE_URL="<paste the same Neon connection string>" npx prisma migrate deploy
DATABASE_URL="<same string>" npx prisma db seed
```
This creates the tables and one admin login. Tell me once this runs and I'll tell you exactly what changed and what the default login is — then change that password immediately in the app.

## 5. What's still inert on purpose

Basecamp sync, Slack sync, and AI face generation all stay switched off until you register those apps yourself (each needs its own OAuth app registration — that's an account-creation step only you can do, same reason as everywhere else). The site works fully without them; those are optional later upgrades, not blockers.

---

If any single step throws an error, paste me exactly what it says — screenshot or text — and I'll tell you precisely which line is wrong. I won't guess at your setup from a "syntax error" description again; I'll ask you to show me the actual message first.
