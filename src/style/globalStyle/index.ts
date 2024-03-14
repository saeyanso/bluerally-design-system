import { css } from '@emotion/react';

import { theme } from '..';

export const reset = () => css`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.6/dist/web/static/pretendard-dynamic-subset.css');

  * {
    box-sizing: border-box;
  }

  html,
  body,
  div,
  dl,
  dt,
  dd,
  ul,
  ol,
  li,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  pre,
  code,
  form,
  fieldset,
  legend,
  input,
  button,
  textarea,
  p,
  blockquote,
  th,
  td,
  a {
    margin: 0;
    padding: 0;
    font-family: 'Malgun Gothic', 'Pretendard Variable', Pretendard,
      -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue',
      'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
  }

  button,
  img {
    border: none;
  }

  ol,
  ul,
  li {
    list-style: none;
  }

  a {
    color: ${theme.palette.primary.main};
    cursor: pointer;
    text-decoration: none;
  }
`;
