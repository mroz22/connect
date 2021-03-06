/* @flow */
import type { GetAddress } from '../../js/types';

const showSegwit = () => {
    const testPayloads: GetAddress[] = [
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'/0/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'/0/1",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'/1/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'/1/1",
            showOnTrezor: true,
        },
    ];
    const expectedResponses = [
        {
            payload: {
                address: '3AnYTd2FGxJLNKL1AzxfW3FJMntp9D2KKX',
            },
        },
        {
            payload: {
                address: '3CBs2AG2se3c3DxASUfgZE3PPwpMW1JhYp',
            },
        },
        {
            payload: {
                address: '3DDuECA7AomS7GSf5G2NAF6djKEqF2qma5',
            },
        },
        {
            payload: {
                address: '33Levhyt79XBK68BwyK61y5F1tE2ia7nZR',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/showSegwit',
    };
};

export const getAddressSegwit = () => {
    const availableSubtests = {
        showSegwit,
    };
    const testName = 'GetAddressSegwit';

    return {
        subtests: {
            ...availableSubtests,
        },
        testName,
        mnemonic: 'mnemonic_12',
    };
};
