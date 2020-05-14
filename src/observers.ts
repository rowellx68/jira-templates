import camelCase from 'lodash.camelcase';
import { browser } from 'webextension-polyfill-ts';
import { indexesOf } from '@src/utilities/helpers';

const templateShortcut = (ev: KeyboardEvent) => {
  if (!['ArrowRight', 'ArrowLeft'].includes(ev.key) || !ev.shiftKey) {
    return;
  }

  ev.preventDefault();
  ev.stopPropagation();

  const input = ev.target as HTMLTextAreaElement;

  const indexes = indexesOf(input.value, /<TI>|<\/TI>/g);

  if (!Object.keys(indexes).length) {
    return;
  }

  if (input.selectionStart === input.selectionEnd) {
    input.setSelectionRange(indexes['<TI>'][0], indexes['</TI>'][0] + 5);

    return;
  }

  const direction = ev.key === 'ArrowRight' ? 1 : -1;

  const nextPlaceholderIndex =
    indexes['<TI>'].indexOf(input.selectionStart) + direction;

  if (!indexes['<TI>'][nextPlaceholderIndex]) {
    const nextIndex = ev.key === 'ArrowRight' ? 0 : indexes['<TI>'].length - 1;

    input.setSelectionRange(
      indexes['<TI>'][nextIndex],
      indexes['</TI>'][nextIndex] + 5,
    );

    return;
  }

  input.setSelectionRange(
    indexes['<TI>'][nextPlaceholderIndex],
    indexes['</TI>'][nextPlaceholderIndex] + 5,
  );
};

const observeDocument = (mutation: MutationRecord) => {
  if (!document.getElementById('create-issue-dialog')) {
    return;
  }

  const target = mutation.target as HTMLTextAreaElement;

  if (target.id !== 'description') {
    return;
  }

  const toggles = document.querySelectorAll(
    '.editor-toggle-tabs .aui-nav > li > a',
  ) as NodeListOf<HTMLAnchorElement>;
  toggles[1]?.click();

  const projectInput = document.getElementById(
    'project-field',
  ) as HTMLInputElement;

  const projectKey = /\(([^)]+)\)/.exec(projectInput.value)?.pop();

  if (!projectKey) {
    return;
  }

  browser.storage.local.get(projectKey).then((project) => {
    if (!project) {
      return;
    }

    const templates = project[projectKey];

    if (!templates) {
      return;
    }

    const issueTypeInput = document.getElementById(
      'issuetype-field',
    ) as HTMLInputElement;

    const key = camelCase(issueTypeInput.value);
    const text = templates[key];

    setTimeout(() => {
      target.value = text;
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const starIndex = target.value.indexOf('<TI>');
      const endIndex = target.value.indexOf('</TI>');

      if (starIndex === -1 || endIndex === -1) {
        return;
      }

      target.setSelectionRange(starIndex, endIndex + 5);
      target.addEventListener('keydown', templateShortcut);
      target.scrollTop = 0;
    }, 200);
  });
};

export const documentObserver = new MutationObserver((mutations) =>
  mutations.forEach(observeDocument),
);
