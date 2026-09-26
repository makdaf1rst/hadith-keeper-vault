<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Backend binding

- `.env` must point at the Lovable-managed backend `sbyhmcfdxypadielbfql`. Never
  "restore" it to `zhmzhmwmbutzevayumov` (the values in older commits such as
  `34057c5`): that backend exposes no `public.hadiths` table, so the library
  would render empty. The platform writes and auto-syncs this file — do not
  hand-edit it.
