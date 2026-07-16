import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendUserCredentials(
    email: string,
    password: string,
    nom: string,
    prenom: string,
  ) {
   
    console.log('');
    console.log(`À : ${email}`);
    console.log(`Bonjour ${prenom} ${nom}`);
    console.log(`Mot de passe : ${password}`);
    console.log('');

    
  }
}
