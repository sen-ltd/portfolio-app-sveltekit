<!--
  Shared SVG brand icon wrapper. Each caller passes the brand title, canonical
  color, and path data; the wrapper handles sizing and accessibility.
-->
<script lang="ts">
  type Props = {
    title: string;
    color: string;
    d: string;
    size?: number;
    className?: string;
  };

  let { title, color, d, size = 20, className = '' }: Props = $props();
</script>

<svg
  role="img"
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill={color}
  aria-label={title}
  class={className}
>
  <title>{title}</title>
  <path {d} />
</svg>
