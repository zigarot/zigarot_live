export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("matrix.js");
  eleventyConfig.addPassthroughCopy("form.js");
  eleventyConfig.addPassthroughCopy("stream-live.js");
  eleventyConfig.addPassthroughCopy("stream-schedule.js");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("_redirects");
};
