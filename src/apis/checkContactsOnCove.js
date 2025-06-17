import {apiService} from './apiService';
import {endpoints} from './endpoints';

export const checkContactsOnCove = async ({contacts}) => {
  const contactsNumbers = contacts.map(contact => contact.phone);
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.checkContacts,
      method: 'POST',
      data: {contacts: contactsNumbers},
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
