import type { Page } from '@playwright/test';

export type OverlayProbeRow = {
  state: string;
  element: string;
  coverage: number;
  fullViewport: boolean;
  allowed: boolean;
};

export async function probeOverlayInput(
  page: Page,
  state: string,
  allowedModalTestId?: string,
): Promise<{ rows: OverlayProbeRow[]; violations: OverlayProbeRow[] }> {
  const rows = await page.evaluate(
    ({ stateName, allowedTestId }) => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const viewportArea = viewport.width * viewport.height;
      return Array.from(document.querySelectorAll<HTMLElement>('body *')).flatMap((element) => {
        const style = getComputedStyle(element);
        if (!['fixed', 'absolute'].includes(style.position) || style.pointerEvents === 'none') return [];
        const rect = element.getBoundingClientRect();
        const width = Math.max(0, Math.min(rect.right, viewport.width) - Math.max(rect.left, 0));
        const height = Math.max(0, Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0));
        const coverage = viewportArea ? (width * height) / viewportArea : 0;
        if (coverage <= 0.2) return [];
        const fullViewport = rect.left <= 1 && rect.top <= 1 && rect.right >= viewport.width - 1 && rect.bottom >= viewport.height - 1;
        const testId = element.dataset.testid;
        return [{
          state: stateName,
          element: testId ? `[data-testid="${testId}"]` : element.id ? `#${element.id}` : `${element.tagName.toLowerCase()}.${[...element.classList].join('.')}`,
          coverage: Math.round(coverage * 1_000) / 10,
          fullViewport,
          allowed: !fullViewport || testId === allowedTestId,
        }];
      });
    },
    { stateName: state, allowedTestId: allowedModalTestId },
  );
  return { rows, violations: rows.filter((row) => !row.allowed) };
}

