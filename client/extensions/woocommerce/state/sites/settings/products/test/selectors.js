/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areSettingsProductsLoaded,
	areSettingsProductsLoading,
	getWeightUnitSetting,
	getDimensionsUnitSetting,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						products: null,
					},
				},
			},
		},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						products: LOADING,
					},
				},
			},
		},
	},
};
const weightUnitSetting = {
	id: 'woocommerce_weight_unit',
	label: 'Weight unit',
	type: 'select',
	default: 'kg',
	value: 'lbs',
};
const dimensionsUnitSetting = {
	id: 'woocommerce_dimension_unit',
	label: 'Dimensions unit',
	type: 'select',
	default: 'cm',
	value: 'in',
};
const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						products: [ weightUnitSetting, dimensionsUnitSetting ],
					},
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areSettingsProductsLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areSettingsProductsLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when products settings are currently being fetched.', () => {
			expect( areSettingsProductsLoaded( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should be true when products settings are loaded.', () => {
			expect( areSettingsProductsLoaded( loadedState, 123 ) ).to.be.true;
		} );

		test( 'should be false when products settings are loaded only for a different site.', () => {
			expect( areSettingsProductsLoaded( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSettingsProductsLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#areSettingsProductsLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areSettingsProductsLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when products settings are currently being fetched.', () => {
			expect( areSettingsProductsLoading( loadingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when products settings are loaded.', () => {
			expect( areSettingsProductsLoading( loadedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when products settings are loaded only for a different site.', () => {
			expect( areSettingsProductsLoading( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSettingsProductsLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#getWeightUnitSetting', () => {
		test( 'should get the weight unit setting from the state.', () => {
			expect( getWeightUnitSetting( loadedState, 123 ) ).to.eql( weightUnitSetting );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getWeightUnitSetting( loadedStateWithUi ) ).to.eql( weightUnitSetting );
		} );
	} );

	describe( '#getDimensionsUnitSetting', () => {
		test( 'should get the dimensions unit setting from the state.', () => {
			expect( getDimensionsUnitSetting( loadedState, 123 ) ).to.eql( dimensionsUnitSetting );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getDimensionsUnitSetting( loadedStateWithUi ) ).to.eql( dimensionsUnitSetting );
		} );
	} );
} );
