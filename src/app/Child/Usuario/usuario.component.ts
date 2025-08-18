import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service'; // Ajusta la ruta según sea necesario

// Definimos la interfaz para la entidad Usuario
interface Usuario {
  Id: number | null;
  Nombre: string;
  Contrasena: string;
}

@Component({
  selector: 'app-usuario', // Selector para el componente
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './usuario.component.html', // Archivo de plantilla HTML
  styleUrl: './usuario.component.css' // Archivo de estilos CSS
})
export class UsuarioComponent implements OnInit {

  // Array para almacenar los usuarios
  usuarios: Usuario[] = []; 
  
  // Objeto para un nuevo usuario
  nuevoUsuario: Usuario = {
    Id: null,
    Nombre: '',
    Contrasena: ''
  };
  
  // Mensaje para mostrar errores
  errorMsg: string = ''; 

  constructor(private usuarioService: UsuarioService) {
    // Constructor, la carga de datos se realiza en ngOnInit
  }

  ngOnInit(): void {
    this.loadUsuarios(); // Carga los datos cuando el componente se inicializa
  }

  /**
   * Carga todos los Usuarios desde el servicio.
   */
  async loadUsuarios() {
    this.errorMsg = ''; // Limpia cualquier mensaje de error previo
    try {
      this.usuarios = await this.usuarioService.getAllUsuarios();
      // console.log('Datos Usuarios', JSON.stringify(this.usuarios)); // Descomentar para depuración
    } catch (error: any) {
      this.errorMsg = error.message || 'Error desconocido al cargar los usuarios.';
      console.error('❌ ERROR AL CARGAR LOS USUARIOS:', error);
    }
  }

  /**
   * Recarga la lista de usuarios.
   */
  async recargarUsuarios() {
    this.errorMsg = ''; // Limpia cualquier mensaje de error previo
    try {
      this.usuarios = await this.usuarioService.getAllUsuarios();
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al recargar usuarios.';
      console.error('❌ ERROR AL RECARGAR USUARIOS:', error);
    }
  }

  /**
   * Guarda un nuevo usuario usando el servicio.
   */
  async guardarUsuario() {
    console.log('INTENTANDO GUARDAR - Original:', this.nuevoUsuario);

    try {
      // Prepara los datos para enviar al backend, alineándolos con la tabla Beca.Usuario
      const dataEnviar = {
        Id: 0, // Id es típicamente auto-generado por el backend
        Nombre: this.nuevoUsuario.Nombre,
        Contrasena: this.nuevoUsuario.Contrasena,
      };

      console.log('DATOS A ENVIAR AL BACKEND:', dataEnviar);

      const guardado = await this.usuarioService.createUsuario(dataEnviar);

      console.log('RESPUESTA DEL BACKEND:', guardado);

      this.limpiarFormulario(); // Limpia el formulario después de guardar exitosamente
      this.recargarUsuarios(); // Recarga la lista para mostrar el nuevo usuario
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al guardar usuario.';
      console.error('❌ ERROR AL GUARDAR USUARIO:', error);
    }
  }

  /**
   * Limpia la lista de usuarios mostrados.
   */
  limpiarUsuarios() {
    this.usuarios = []; // Vacía el array
    this.errorMsg = ''; // Limpia el mensaje de error
  }

  /**
   * Restablece los campos del formulario para un nuevo usuario.
   */
  limpiarFormulario() {
    this.nuevoUsuario = { // Restablece el objeto
      Id: null,
      Nombre: '',
      Contrasena: ''
    };
    this.errorMsg = ''; // Limpia el mensaje de error
  }
}
