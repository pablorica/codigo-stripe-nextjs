import type { Schema, Struct } from '@strapi/strapi';

export interface ButtonButton extends Struct.ComponentSchema {
  collectionName: 'components_button_buttons';
  info: {
    displayName: 'button';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface ButtonCtas extends Struct.ComponentSchema {
  collectionName: 'components_button_ctas';
  info: {
    displayName: 'ctas';
  };
  attributes: {};
}

export interface MemberMember extends Struct.ComponentSchema {
  collectionName: 'components_member_members';
  info: {
    displayName: 'member';
  };
  attributes: {
    name: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    role: Schema.Attribute.String;
    social: Schema.Attribute.Component<'button.button', true>;
  };
}

export interface SocialLink extends Struct.ComponentSchema {
  collectionName: 'components_social_links';
  info: {
    displayName: 'Link';
  };
  attributes: {};
}

export interface SocialSocial extends Struct.ComponentSchema {
  collectionName: 'components_social_socials';
  info: {
    displayName: 'social';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'button.button': ButtonButton;
      'button.ctas': ButtonCtas;
      'member.member': MemberMember;
      'social.link': SocialLink;
      'social.social': SocialSocial;
    }
  }
}
