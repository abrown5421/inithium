import { createCollectionRouter } from '@inithium/api-core';
import { assetValidators } from '@inithium/validators';
import type { Asset } from '@inithium/types';
import { assetsService } from './assets.service.js';

export const assetsRouter = createCollectionRouter<Asset>(assetsService, assetValidators);
