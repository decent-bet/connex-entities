import { OnConnexReady } from './../BaseConnexContract';
import {
    ConnexContract,
    GetMethod,
    Read,
    GetEventSignature,
    GetMethodSignature,
    Write,
    AccountEventFilter
} from '../ConnexContractDecorators';
import { EnergyTokenContract } from '../examples/EnergyContractService';
import { IConnexMethodOrEventCall, IConnexContract } from '../types';
import { AbiUtils } from '../Utils';

const abiMethod = {
    constant: false,
    inputs: [
        {
            name: '_to',
            type: 'address'
        },
        {
            name: '_amount',
            type: 'uint256'
        }
    ],
    name: 'transfer',
    outputs: [
        {
            name: 'success',
            type: 'bool'
        }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
};
const abiEvent = {
    anonymous: false,
    inputs: [
        {
            indexed: true,
            name: '_from',
            type: 'address'
        },
        {
            indexed: true,
            name: '_to',
            type: 'address'
        },
        {
            indexed: false,
            name: '_value',
            type: 'uint256'
        }
    ],
    name: 'Transfer',
    type: 'event'
};

@ConnexContract({
    import: {
        address: [{ a: 1 }],
        raw: {
            abi: [
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            name: '_from',
                            type: 'address'
                        },
                        {
                            indexed: true,
                            name: '_to',
                            type: 'address'
                        },
                        {
                            indexed: false,
                            name: '_value',
                            type: 'uint256'
                        }
                    ],
                    name: 'Transfer',
                    type: 'event'
                }
            ]
        }
    }
})
class Test extends OnConnexReady {

    constructor(){
        super();
    }

}

describe('Connex Entities', () => {
    describe('#ConnexContract', () => {
        it('should create a class that inherits from BaseConnexContract', async () => {
            const connex = {} as Connex;
            const chainTag = '0xa4';
            const defaultAccount = '0x';
            const instance = (new Test() as any);
            instance.onConnexReady(connex, chainTag, defaultAccount);
            expect(instance.chainTag).toBe(chainTag);
            expect(instance.defaultAccount).toBe(defaultAccount);            
        });

        it('should create a GetMethod() and return a Connex.Thor.VMOutput', async () => {
            // Mock
            const obj = {
                getMethod: jest.fn((name, add) => {
                    return Promise.resolve({} as Connex.Thor.VMOutput);
                })
            };
            const options: IConnexMethodOrEventCall = {};
            const descriptor = GetMethod(options);
            const original = {};
            const pd = descriptor(null, 'balanceOf', original);

            const promise = pd.value.bind(obj)();
            expect(obj.getMethod.mock.calls.length).toBe(1);
        });

        it('should create a Read() and return an object', async () => {
            const callMock = jest.fn(i =>
                Promise.resolve({ decoded: { 0: true } })
            );
            // Mock
            const obj = {
                getMethod: jest.fn(i => {
                    return {
                        call: callMock
                    };
                })
            };
            const options: IConnexMethodOrEventCall = {};
            const descriptor = Read(options);
            const original = {};
            const pd = descriptor(null, 'balanceOf', original);

            const promise = await pd.value.bind(obj)();
            expect(obj.getMethod.mock.calls.length).toBe(1);
            expect(callMock.mock.calls.length).toBe(1);
        });

        it('should create a GetEventSignature() and return a string', async () => {
            // Mock
            const obj = {
                getAbiMethod: () => abiEvent
            };
            const descriptor = GetEventSignature();
            const original = {};
            const pd = descriptor(null, 'Transfer', original);

            const signature = await pd.value.bind(obj)();
            expect(signature).toBe(
                AbiUtils.encodeEventSignature(
                    `Transfer(address,address,uint256)`
                )
            );
        });

        it('should create a GetMethodSignature() and return a string', async () => {
            // Mock
            const obj = {
                getAbiMethod: () => abiMethod
            };
            const descriptor = GetMethodSignature();
            const original = {};
            const pd = descriptor(null, 'transfer', original);

            const signature = await pd.value.bind(obj)();
            expect(signature).toBe(
                AbiUtils.encodeFunctionSignature(`transfer(address,uint256)`)
            );
        });

        it('should create a Write() and return a Promise', async () => {
            const gasMock = jest.fn();
            const requestMock = jest.fn();
            const clauseMock = jest.fn();
            const signerMock = jest.fn(() => {
                return {
                    gas: jest.fn(() => {
                        return { request: jest.fn() }
                    })
                }
            })
            // Mock
            const obj = {
                connex: {
                    vendor: {
                        sign: jest.fn(() => {
                            return {
                                signer: signerMock,
                                gas: gasMock,
                                request: requestMock
                            }
                        })
                    }
                },
                getMethod: jest.fn(i => {
                    return {
                        asClause: clauseMock
                    };
                }),
            };
            const descriptor = Write();
            const original = {};
            const pd = descriptor(null, 'transfer', original);

            await pd.value.bind(obj)();

            expect(obj.getMethod.mock.calls.length).toBe(1);
            expect(signerMock.mock.calls.length).toBe(1);
            expect(clauseMock.mock.calls.length).toBe(1);
        });

        it('should create a AccountEventFilter() with an interval and return an Observable', async () => {
            const filterMock = jest.fn();
            // Mock
            const obj = {
                getEvent: jest.fn(i => {
                    return {
                        filter: filterMock
                    };
                })
            };
            const descriptor = AccountEventFilter({
                nameOrAbi: 'Transfer',
                interval: 10_000
            });

            const applyMock = jest.fn();
            const original = {
                value: {
                    apply: applyMock
                }
            };
            const pd = descriptor(null, 'transfer', original);

            await pd.value.bind(obj)();

            expect(obj.getEvent.mock.calls.length).toBe(1);
            expect(filterMock.mock.calls.length).toBe(1);
            expect(applyMock.mock.calls.length).toBe(1);
        });
    });
});
