import { HashUserID } from '../../src/helpers/hashUserId';

describe('HashUserID', () => {

    beforeEach(() => {
        HashUserID.resetHash();
    });

    const userID_1 = '12345';
    const userID_1_hash = '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5';
    const userID_2 = '24680';
    const userID_2_hash = '332e59d1b415d4ff66902f683fef92b43932595e64a520e18e17c00b04c279ca';


    it('should hash the user ID', () => {
        const hashedUserID = HashUserID.hashUserID(userID_1);
        expect(hashedUserID).toEqual(userID_1_hash);
    });

    it('should return the hash of the first user ID no matter the later user IDs', () => {
        const hashedUserID = HashUserID.hashUserID(userID_1);
        expect(hashedUserID).toEqual(userID_1_hash);
        const hashedUserID2 = HashUserID.hashUserID(userID_2);
        expect(hashedUserID2).toEqual(userID_1_hash);
    });

    it('should reset the hash', () => {
        const hashedUserID = HashUserID.hashUserID(userID_1);
        expect(hashedUserID).toEqual(userID_1_hash);
        HashUserID.resetHash();
        const hashedUserID2 = HashUserID.hashUserID(userID_2);
        expect(hashedUserID2).toEqual(userID_2_hash);
    });
    
});