<script lang="ts">
  import { Header, HeaderActionLink, HeaderUtilities } from 'carbon-components-svelte'
  import LogoGithub20 from 'carbon-icons-svelte/lib/LogoGithub20'
  import pkg from '../../package.json'
</script>

<Header>
  <span slot="platform">
    tech-choice
    <code>v{pkg.version}</code>
  </span>

  <HeaderUtilities>
    <HeaderActionLink
      icon={LogoGithub20}
      href="https://github.com/KoichiKiyokawa/tech-choice"
      target="_blank"
    />
  </HeaderUtilities>
</Header>

<main>
  <slot />
</main>

<style>
  span[slot='platform'] {
    font-size: 1.2rem;
  }
  code {
    font-size: 0.8rem;
    color: #c6c6c6;
    font-weight: normal;
    margin-left: 0.5rem;
  }
</style>
