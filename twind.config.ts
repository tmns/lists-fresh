import { defineConfig } from 'https://esm.sh/@twind/core@1.1.3'
import presetTailwind from 'https://esm.sh/@twind/preset-tailwind@1.1.4'
import presetAutoprefix from 'https://esm.sh/@twind/preset-autoprefix@1.0.7'
import presetTypography from '@twind/preset-typography'

export default {
  ...defineConfig({
    presets: [presetTailwind(), presetAutoprefix(), presetTypography({ defaultColor: 'white' })],
  }),
  selfURL: import.meta.url,
}
