import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module.js';

describe('AppModule', () => {
  it('provides the server composition root', () => {
    expect(AppModule).toBeDefined();
  });
});
