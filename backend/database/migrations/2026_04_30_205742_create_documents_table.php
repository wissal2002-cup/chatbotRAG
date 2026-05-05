<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('documents', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')
              ->constrained()
              ->onDelete('cascade');
        $table->string('title');
        $table->string('module');
        $table->enum('semester', ['S1','S2','S3','S4','S5','S6']);
        $table->text('description')->nullable();
        $table->string('file_path');
        $table->integer('file_size');
        $table->longText('extracted_text')->nullable();
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
