/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import CreditCardPaymentBox from './credit-card-payment-box';

export default class PaymentBox extends PureComponent {
	static displayName = 'PaymentBox';

	render() {
		const cardClass = classNames( 'payment-box', this.props.classSet ),
			contentClass = classNames( 'payment-box__content', this.props.contentClassSet );
		return (
			// <ReactCSSTransitionGroup
			// 	transitionName={ 'checkout__payment-box-container' }
			// 	transitionAppear={ true }
			// 	transitionAppearTimeout={ 400 }
			// 	transitionEnter={ true }
			// 	transitionEnterTimeout={ 400 }
			// 	transitionLeave={ false }
			// >
			<div className="checkout__payment-box-container" key={ this.props.currentPage }>
				<SectionNav>
					<NavTabs>
						<span>{ this.props.title }</span>
						<NavItem key="credit" selected={ true }>
							Credit Card
						</NavItem>
						<NavItem key="paypal">
							<img
								src="/calypso/images/upgrades/paypal.svg"
								alt="PayPal"
								className="checkout__paypal"
							/>
						</NavItem>
						<NavItem key="ideal">iDEAL</NavItem>
					</NavTabs>
				</SectionNav>
				<Card className={ cardClass }>
					<div className="checkout__box-padding">
						<div className={ contentClass }>{ this.content() }</div>
					</div>
				</Card>
			</div>
			// </ReactCSSTransitionGroup>
		);
	}

	content() {
		if ( this.props.selected != 'credit-card' ) {
			return null;
		}
		return (
			<CreditCardPaymentBox
				cards={ this.props.cards }
				transaction={ this.props.transaction }
				cart={ this.props.cart }
				countriesList={ this.props.countriesList }
				initialCard={ this.props.initialCard }
				paymentMethods={ this.props.paymentMethods }
				selectedSite={ this.props.selectedSite }
				onSelectPaymentMethod={ this.props.onSelectPaymentMethod }
				onSubmit={ this.props.onSubmit }
				transactionStep={ this.props.transactionStep }
			/>
		);
	}
}
