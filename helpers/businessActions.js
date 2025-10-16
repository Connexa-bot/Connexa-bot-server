// helpers/businessActions.js
// ===============================
// Business features for WhatsApp Business accounts
// ===============================

import { getClient } from "./whatsapp.js";

/**
 * Get business profile information
 * @param {string} phone - User's phone number
 * @param {string} jid - Business account JID
 * @returns {Promise<object>} Business profile
 */
export async function getBusinessProfile(phone, jid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    const profile = await client.getBusinessProfile(jid);
    
    if (!profile) {
      return {
        success: false,
        error: 'Not a business account or profile not available'
      };
    }

    return {
      success: true,
      profile: {
        wid: profile.wid,
        description: profile.description || '',
        category: profile.category || '',
        email: profile.email || '',
        website: profile.website || [],
        address: profile.address || '',
        businessHours: profile.business_hours || {},
        verifiedLevel: profile.verified_level || 'none',
        verifiedName: profile.verified_name || null
      }
    };
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch business profile'
    };
  }
}

/**
 * Get business product catalog
 * @param {string} phone - User's phone number
 * @param {string} jid - Business account JID
 * @returns {Promise<object>} Product catalog
 */
export async function getBusinessCatalog(phone, jid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    const catalog = await client.query({
      tag: 'iq',
      attrs: {
        to: jid,
        type: 'get',
        xmlns: 'w:biz:catalog'
      },
      content: [
        {
          tag: 'product_catalog',
          attrs: {
            v: '2'
          }
        }
      ]
    });

    if (!catalog || !catalog.content) {
      return {
        success: false,
        error: 'No catalog available for this business'
      };
    }

    const products = parseCatalogResponse(catalog);

    return {
      success: true,
      catalog: {
        jid,
        productCount: products.length,
        products
      }
    };
  } catch (error) {
    console.error('Error fetching business catalog:', error);
    
    return {
      success: false,
      error: 'Catalog features have limited support in Baileys',
      message: 'Business catalog API is not fully supported. Use WhatsApp Business API for complete catalog access.'
    };
  }
}

/**
 * Get specific catalog item
 * @param {string} phone - User's phone number
 * @param {string} jid - Business account JID
 * @param {string} itemId - Product/item ID
 * @returns {Promise<object>} Product details
 */
export async function getCatalogItem(phone, jid, itemId) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    const item = await client.query({
      tag: 'iq',
      attrs: {
        to: jid,
        type: 'get',
        xmlns: 'w:biz:catalog'
      },
      content: [
        {
          tag: 'product',
          attrs: {
            'product-id': itemId
          }
        }
      ]
    });

    if (!item || !item.content) {
      return {
        success: false,
        error: 'Product not found'
      };
    }

    const product = parseProductItem(item);

    return {
      success: true,
      product
    };
  } catch (error) {
    console.error('Error fetching catalog item:', error);
    
    return {
      success: false,
      error: 'Catalog item features have limited support in Baileys',
      message: 'Business catalog API is not fully supported. Use WhatsApp Business API for complete product access.'
    };
  }
}

/**
 * Parse catalog response to product array
 */
function parseCatalogResponse(catalog) {
  const products = [];
  
  try {
    if (catalog.content && Array.isArray(catalog.content)) {
      for (const item of catalog.content) {
        if (item.tag === 'product') {
          products.push(parseProductItem(item));
        }
      }
    }
  } catch (error) {
    console.error('Error parsing catalog:', error);
  }

  return products;
}

/**
 * Parse individual product item
 */
function parseProductItem(item) {
  try {
    const attrs = item.attrs || {};
    const content = item.content || [];
    
    const product = {
      id: attrs['product-id'] || attrs.id,
      name: '',
      description: '',
      price: '',
      currency: '',
      imageUrl: '',
      availability: 'in_stock'
    };

    for (const field of content) {
      if (field.tag === 'name') product.name = field.content || '';
      if (field.tag === 'description') product.description = field.content || '';
      if (field.tag === 'price') product.price = field.content || '';
      if (field.tag === 'currency') product.currency = field.content || '';
      if (field.tag === 'image') product.imageUrl = field.attrs?.url || '';
      if (field.tag === 'availability') product.availability = field.content || 'in_stock';
    }

    return product;
  } catch (error) {
    console.error('Error parsing product item:', error);
    return { id: 'unknown', name: 'Unknown Product' };
  }
}
