import postcssGlobalData from '@csstools/postcss-global-data'
import autoprefixer from 'autoprefixer'
import postcssCustomMedia from 'postcss-custom-media'

export default {
  plugins: [
    postcssGlobalData({ files: ['src/styles/media.css'] }),
    postcssCustomMedia(),
    autoprefixer(),
  ],
}
