import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import type { ComponentType } from 'react';

export async function compileMdx(source: string): Promise<ComponentType<any> | null> {
  try {
    const mod = await evaluate(source, {
      ...(runtime as any),
      development: false,
    });
    return (mod.default as ComponentType<any>) ?? null;
  } catch (err) {
    throw err;
  }
}
