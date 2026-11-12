# Origin

This folder holds humanizer, a general skill this fork carries unchanged from its own repository (decision 0081 §7 in Ultimate Brain).

- **Repository:** https://github.com/blader/humanizer
- **Commit:** `b48c832f0f809c1b5658edbb838c2521b72f2413` (humanizer 4.0.0)
- **Licence:** MIT, in [LICENSE](LICENSE), kept verbatim with its copyright line.
- **Copied unchanged, byte for byte:** `SKILL.md`, `LICENSE` and `agents/openai.yaml`, at the same paths. The rest of the upstream repository (its plugin manifests, scripts, workflows, README and changelog) is not copied.
- **Local:** this file only.

## Rules

- The copied files are never edited here, not even to follow this fork's writing rules. A copy that differs from the commit above is a defect.
- An update is a pull request that copies the same files from a newer upstream commit and changes the commit above. It declares `Brain impact: none`.
- The operational skills in `brain/` never call humanizer: it may not be installed, and it is too long to load on every run. They follow their own short writing reference instead.

To check the copy, from a clone of the upstream repository:

```sh
for f in SKILL.md LICENSE agents/openai.yaml; do
  git -C <upstream clone> show b48c832f0f809c1b5658edbb838c2521b72f2413:$f | cmp - third-party/humanizer/$f
done
```
